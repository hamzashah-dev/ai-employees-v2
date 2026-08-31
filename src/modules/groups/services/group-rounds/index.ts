import {
  GROUP_HISTORY_LIMIT,
  GROUP_MAX_CONTINUATIONS,
  GROUP_MAX_MESSAGES,
  GROUP_MAX_ROUNDS,
} from '@/modules/core/constants/groups'
import { useGroupStore } from '@/modules/core/stores/group-store'
import type { GroupMessage, GroupRoom, GroupRoundExit } from '@/modules/core/types/groups'
import { formatGroupLine } from '../../utils/format-line'
import { resolveGroupResponders } from '../../utils/resolve-responders'
import { rotateGroupSpeakers } from '../../utils/rotate-speakers'
import { shouldCommitMemberTurn } from '../../utils/should-commit'
import { buildGroupTurnPrompt } from '../../utils/turn-prompt'
import { unaddressedGroupMentions } from '../../utils/unaddressed-mentions'
import {
  ensureGroupSession,
  harvestGroupTurn,
  runGroupTurn,
} from '../group-turns'
import type { GroupSessionHandle } from '../group-turns'

/**
 * The room engine: who speaks, in what order, and when the room falls quiet.
 *
 * One user send drives at most {@link GROUP_MAX_ROUNDS} *serial* round-robin
 * passes over the roster. Never parallel, and never routed by a model — who
 * responds is a deterministic `@mention` parse, and whether they actually say
 * anything is each member's own choice. A member with nothing to add replies
 * `(pass)`, and a full round of passes is what "the conversation settled"
 * means. The caps are the only other way out.
 *
 * Every member is fed ONLY the room entries that are new since its own last
 * turn. That is what keeps six members affordable, and it is why the watermark
 * bookkeeping below is load-bearing rather than an optimisation.
 *
 * Ported from `apps/desktop/src/plugins/computer-bots/group-rounds.ts`.
 */

interface RoundContext {
  members: string[]
  roomId: string
  startEpoch: number
  thread: string
}

function readRoom(roomId: string): GroupRoom | undefined {
  return useGroupStore.getState().rooms[roomId]
}

function threadLog(room: GroupRoom, thread: string): GroupMessage[] {
  return room.log.filter((entry) => entry.thread === thread)
}

/**
 * Deliver replies from turns that outlived their timeout.
 *
 * Runs for every member each round, not just the ones due to speak, so a slow
 * answer is late rather than lost. A member still working keeps its marker and
 * is skipped as a responder — re-prompting a live session would make the
 * gateway interrupt the very work we are waiting on.
 */
async function harvestStranded(context: RoundContext): Promise<void> {
  const room = readRoom(context.roomId)
  if (!room) return

  for (const member of context.members) {
    const marker = room.stranded[member]
    if (!marker) continue

    const storedId = room.sessions[member]
    if (!storedId) {
      useGroupStore.getState().setStranded(context.roomId, member, null)
      continue
    }

    const harvested = await harvestGroupTurn(
      context.roomId,
      member,
      storedId,
      marker.before,
    )
    if (!harvested) continue

    const store = useGroupStore.getState()
    store.setStranded(context.roomId, member, null)

    if (harvested.status !== 'replied' || !harvested.reply) continue

    // Deliver into the thread the turn was dispatched in, NOT the thread being
    // driven now. Every send mints a fresh thread, so a marker almost always
    // outlives its own conversation — harvesting only the current thread would
    // leave the marker forever, and the responder filter keys off its mere
    // presence, muting that member in every future round.
    store.appendEntry(
      context.roomId,
      { kind: 'member', name: member },
      harvested.reply,
      marker.thread,
    )

    const after = readRoom(context.roomId)
    if (after) {
      // Only a member that actually spoke has seen the room. Advancing on a
      // silent harvest would consume a delta it was never shown.
      store.setWatermark(context.roomId, marker.thread, member, after.log.length)
    }
  }
}

/** The delta a member has not yet seen, narrowed to its own thread. */
function deltaFor(room: GroupRoom, thread: string, member: string): GroupMessage[] {
  const seen = room.watermarks[`${thread}::${member}`] ?? 0
  return room.log.slice(seen).filter((entry) => entry.thread === thread)
}

type TurnOutcome = 'cancelled' | 'silent' | 'spoke'

/**
 * One member's turn, from delta to committed reply.
 *
 * The commit guard in the middle is the subtle part: a turn can finish *after*
 * a newer user send has already bumped the epoch and re-driven this member with
 * the full delta. Committing then would post the same reply twice, so the
 * result is dropped before the watermark moves and before the append.
 */
async function runMemberTurn(
  context: RoundContext,
  member: string,
): Promise<TurnOutcome> {
  const room = readRoom(context.roomId)
  if (!room) return 'cancelled'

  const delta = deltaFor(room, context.thread, member)
  if (!delta.length) return 'silent'

  const store = useGroupStore.getState()

  // A held member consumes its delta exactly once, so the same entries cannot
  // re-trigger this skip on the next round, and the room explains the silence
  // once rather than every round.
  if (room.holds[member]) {
    store.setWatermark(context.roomId, context.thread, member, room.log.length)
    if (!room.holds[member]?.noted) store.markHoldNoted(context.roomId, member)
    return 'silent'
  }

  const deltaLines = delta
    .slice(-GROUP_HISTORY_LIMIT)
    .map((entry) => formatGroupLine(entry, member))

  const prompt = buildGroupTurnPrompt({
    deltaLines,
    groupName: room.name,
    members: context.members,
    viewer: member,
  })

  const anchorId = room.log.length ? room.log[room.log.length - 1]?.id ?? null : null
  const before = room.log.length

  let handle: GroupSessionHandle
  try {
    handle = await ensureGroupSession(context.roomId, member, room.sessions[member])
  } catch {
    // A member whose session cannot be resolved simply does not speak. One
    // broken member must never take the room down.
    return 'silent'
  }
  // Persist the DURABLE key — the short id is dead by the next page load.
  store.setSession(context.roomId, member, handle.storedId)

  const isCurrent = () => (readRoom(context.roomId)?.epoch ?? -1) === context.startEpoch

  store.setTurn(context.roomId, member)
  const result = await runGroupTurn(
    {
      before,
      member,
      prompt,
      roomId: context.roomId,
      sessionId: handle.sessionId,
      storedId: handle.storedId,
    },
    isCurrent,
  )
  store.setTurn(context.roomId, null)

  if (result.status === 'stranded') {
    // `result.before` is the member's session-transcript length, resolved by the
    // turn's pre-read. The room-log length we passed in is a different counter
    // entirely, and harvesting from it scans an empty range — silently binning
    // the finished answer this whole mechanism exists to rescue.
    store.setStranded(context.roomId, member, {
      before: result.before,
      thread: context.thread,
    })
    return 'silent'
  }

  const roomNow = readRoom(context.roomId)
  if (!roomNow) return 'cancelled'

  // Anchor by entry id, not index: the history trim drops from the FRONT, so an
  // index taken before the turn could point past a trimmed log and silently
  // admit a stale reply. An anchor trimmed away means every survivor is newer.
  const anchorIndex = anchorId === null ? -1 : roomNow.log.findIndex((e) => e.id === anchorId)
  const tail = anchorIndex >= 0 ? roomNow.log.slice(anchorIndex + 1) : roomNow.log
  const newerUserEntry = tail.some(
    (entry) => entry.from.kind === 'user' && entry.thread === context.thread,
  )

  if (!shouldCommitMemberTurn(context.startEpoch, roomNow.epoch, newerUserEntry)) {
    return 'cancelled'
  }

  store.setWatermark(context.roomId, context.thread, member, roomNow.log.length)

  if (result.status === 'failed' || !result.reply) return 'silent'

  store.appendEntry(
    context.roomId,
    { kind: 'member', name: member },
    result.reply,
    context.thread,
  )

  const committed = readRoom(context.roomId)
  if (committed) {
    // Its own message counts as seen, or the member would be re-fed its own words.
    store.setWatermark(context.roomId, context.thread, member, committed.log.length)
  }

  return 'spoke'
}

/**
 * Drive a room until it settles or hits a cap.
 *
 * Exported for the composer's send path and for tests; callers should not run
 * two drives for one room concurrently — {@link sendToGroupRoom} enforces that.
 */
export async function runGroupRounds(
  roomId: string,
  thread: string,
): Promise<GroupRoundExit> {
  const initial = readRoom(roomId)
  if (!initial) return 'cancelled'

  const context: RoundContext = {
    members: initial.members,
    roomId,
    startEpoch: initial.epoch,
    thread,
  }

  const isCurrent = () => (readRoom(roomId)?.epoch ?? -1) === context.startEpoch

  let posted = 0
  let continuations = 0
  let exit: GroupRoundExit = 'settled'

  try {
    for (let round = 0; round < GROUP_MAX_ROUNDS; round++) {
      if (!isCurrent()) return 'cancelled'

      // 1-based for the status line: humans count rounds from one.
      useGroupStore.getState().setRound(roomId, round + 1)

      await harvestStranded(context)

      const room = readRoom(roomId)
      if (!room) return 'cancelled'

      const responders = rotateGroupSpeakers(
        resolveGroupResponders(threadLog(room, thread), context.members, thread),
        round,
      ).filter((member) => !room.stranded[member])

      let spokeThisRound = 0

      for (const member of responders) {
        if (!isCurrent()) return 'cancelled'
        if (posted >= GROUP_MAX_MESSAGES) {
          exit = 'capped'
          return exit
        }

        const outcome = await runMemberTurn(context, member)
        if (outcome === 'cancelled') return 'cancelled'
        if (outcome === 'spoke') {
          posted += 1
          spokeThisRound += 1
        }
      }

      if (spokeThisRound > 0) continue

      // A quiet round is not automatically consensus: responders can be narrowed
      // to members with no new delta while an @mention handoff sits unanswered.
      const pending = unaddressedGroupMentions(
        threadLog(readRoom(roomId) ?? room, thread),
        context.members,
        thread,
      )

      continuations += 1
      if (!pending.length) return exit
      if (continuations > GROUP_MAX_CONTINUATIONS) {
        // Work is still owed; the room ran out of budget rather than agreeing.
        exit = 'capped'
        return exit
      }

      // Re-read `stranded`: the harvest above may have cleared markers, and a
      // member still working must NOT be re-prompted here. Its session is live,
      // so a second prompt hits the gateway's busy policy and interrupts the
      // very long-running turn the stranded/harvest mechanism exists to protect.
      const strandedNow = readRoom(roomId)?.stranded ?? {}
      const citedResponders = pending.filter((member) => !strandedNow[member])

      for (const member of citedResponders) {
        if (!isCurrent()) return 'cancelled'
        if (posted >= GROUP_MAX_MESSAGES) {
          exit = 'capped'
          return exit
        }

        const outcome = await runMemberTurn(context, member)
        if (outcome === 'cancelled') return 'cancelled'
        if (outcome === 'spoke') {
          posted += 1
          spokeThisRound += 1
        }
      }

      if (spokeThisRound === 0) return exit
    }

    // Falling out of the loop means the round budget ran out with people still
    // talking — that is a cap, not consensus.
    exit = 'capped'
    return exit
  } finally {
    // Only the drive that still owns the room may touch its status. A
    // superseded one would otherwise blank the live drive's working indicator
    // and stamp its own outcome over the round still in progress.
    if (isCurrent()) {
      const store = useGroupStore.getState()
      store.setTurn(roomId, null)
      store.setRound(roomId, 0)
      store.setExit(roomId, exit)
      store.setRunning(roomId, false)
    }
  }
}
