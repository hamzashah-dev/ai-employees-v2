import { useGroupStore } from '@/modules/core/stores/group-store'
import { applyGroupHoldDirective } from '../../utils/hold-directive'
import { parseGroupMentions } from '../../utils/parse-mentions'
import { runGroupRounds } from '../group-rounds'
import { interruptGroupMember, liveSessionId } from '../group-turns'

/**
 * The user's send: the only thing that starts a room talking.
 *
 * Three things happen here that cannot happen anywhere else. The epoch is
 * bumped, which abandons any turn still in flight from a previous send. Holds
 * are re-evaluated, because user text is the *only* input allowed to hold or
 * release a member — a member saying "I'll stop" must never be able to silence
 * itself. And exactly one drive is started for the room.
 */

/** How long to let a superseded drive notice the epoch bump and bail. */
const DRIVE_HANDOVER_MS = 250

export function mintGroupThreadId(): string {
  const cryptoRef = globalThis.crypto
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return `t-${cryptoRef.randomUUID()}`
  }
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export interface SendToGroupRoomOptions {
  roomId: string
  text: string
  thread?: string | null
}

/**
 * Append the user's message and drive the room.
 *
 * Returns the thread the message landed in, or `null` when there was nothing to
 * send. The drive itself is deliberately not awaited — the composer should
 * return immediately and let the transcript fill in.
 */
export function sendToGroupRoom({
  roomId,
  text,
  thread,
}: SendToGroupRoomOptions): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const store = useGroupStore.getState()
  const room = store.rooms[roomId]
  if (!room || !room.members.length) return null

  const target = thread ?? mintGroupThreadId()
  const wasRunning = room.running

  const sent = store.appendEntry(roomId, { kind: 'user', name: 'You' }, trimmed, target)
  if (!sent) return null

  store.setHolds(
    roomId,
    applyGroupHoldDirective(
      room.holds,
      parseGroupMentions(trimmed, room.members),
      trimmed,
      sent.at,
      room.members,
    ),
  )

  store.bumpEpoch(roomId)
  // Clear the previous drive's outcome, or the status line keeps reporting
  // "Settled" over a round that has only just started.
  store.setExit(roomId, null)
  store.setRunning(roomId, true)

  const drive = () => {
    void runGroupRounds(roomId, target).catch(() => {
      useGroupStore.getState().setRunning(roomId, false)
    })
  }

  if (wasRunning) {
    // A drive is live. It bails at its next member boundary because the epoch
    // moved; chaining after a short settle keeps exactly one drive per room.
    setTimeout(drive, DRIVE_HANDOVER_MS)
  } else {
    drive()
  }

  return target
}

/**
 * Stop a room mid-round.
 *
 * Bumping the epoch is what actually ends the drive — the loop checks it at
 * every member boundary. Holding every member is what keeps the room quiet
 * afterwards, so a stop survives until the user addresses someone again.
 */
export function stopGroupRoom(roomId: string): void {
  const store = useGroupStore.getState()
  const room = store.rooms[roomId]
  if (!room) return

  // The member whose model call is in flight RIGHT NOW. Read before the epoch
  // bump, because the drive clears `turn` as it unwinds.
  const onTurn = room.turn

  store.bumpEpoch(roomId)

  const at = Date.now()
  const holds = { ...room.holds }
  for (const member of room.members) {
    holds[member] = { at, noted: false }
  }
  store.setHolds(roomId, holds)

  store.setRunning(roomId, false)
  store.setTurn(roomId, null)
  // Say what actually happened. Without this the room keeps showing the last
  // drive's "Settled", which reads as agreement rather than a cancellation.
  store.setExit(roomId, 'cancelled')

  // The epoch bump stops the loop at its next member boundary, but it does not
  // touch the request already on the wire. Interrupting is what makes Stop feel
  // immediate instead of "finishes this turn first".
  if (onTurn) {
    const sessionId = liveSessionId(roomId, onTurn)
    if (sessionId) void interruptGroupMember(sessionId)
  }
}
