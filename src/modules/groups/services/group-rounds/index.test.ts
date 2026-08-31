import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GROUP_MAX_MESSAGES, GROUP_MAX_ROUNDS } from '@/modules/core/constants/groups'
import { useGroupStore } from '@/modules/core/stores/group-store'
import type { GroupRoom } from '@/modules/core/types/groups'
import type {
  GroupSessionHandle,
  GroupTurnRequest,
  GroupTurnResult,
} from '../group-turns'
import { runGroupRounds } from './index'

/**
 * The room engine, driven against the real store with the gateway removed.
 *
 * Every test here is really a statement about *bookkeeping*: which member is
 * fed which entries, whose watermark moved, and what the room is allowed to
 * commit once its epoch has been superseded. Mocking `../group-turns` is what
 * makes that observable — a turn becomes "what this member decided to say",
 * chosen by the test, with no socket, no polling and no timers in the way.
 *
 * The store is deliberately NOT mocked. The watermark arithmetic, the echo
 * guard and the hold flags are as much the subject here as the loop is, and a
 * fake store would let a broken loop pass.
 */

const { ensureGroupSession, harvestGroupTurn, runGroupTurn } = vi.hoisted(() => ({
  ensureGroupSession:
    vi.fn<(roomId: string, member: string, storedId?: string) => Promise<GroupSessionHandle>>(),
  harvestGroupTurn:
    vi.fn<
      (
        roomId: string,
        member: string,
        storedId: string,
        before: number,
      ) => Promise<GroupTurnResult | undefined>
    >(),
  runGroupTurn:
    vi.fn<(request: GroupTurnRequest, isCurrent: () => boolean) => Promise<GroupTurnResult>>(),
}))

vi.mock('../group-turns', () => ({ ensureGroupSession, harvestGroupTurn, runGroupTurn }))

const THREAD = 't1'

const PASS: GroupTurnResult = { status: 'replied', reply: null, before: 0 }
const STRANDED: GroupTurnResult = { status: 'stranded', reply: null, before: 7 }
const FAILED: GroupTurnResult = { status: 'failed', reply: null, reason: 'rpc_500', before: 0 }

function speaks(text: string): GroupTurnResult {
  return { status: 'replied', reply: text, before: 0 }
}

/** The two ids a member's session has: the durable key and the live one. */
function handleFor(member: string): GroupSessionHandle {
  return { sessionId: `live-${member}`, storedId: `stored-${member}` }
}

const store = () => useGroupStore.getState()

/**
 * Zustand copies the action set onto every new state object, so a test that
 * wraps an action would leak that wrapper into every later test. Putting the
 * originals back alongside the rooms is the cheapest way to stay isolated.
 */
const pristine = useGroupStore.getState()

function roomOf(id: string): GroupRoom {
  const room = store().rooms[id]

  if (!room) {
    throw new Error(`no room ${id}`)
  }

  return room
}

function makeRoom(members: string[]): string {
  return store().createRoom('Ops', members)
}

function userSays(id: string, text: string, thread = THREAD): void {
  store().appendEntry(id, { kind: 'user', name: 'You' }, text, thread)
}

function memberSays(id: string, name: string, text: string, thread = THREAD): void {
  store().appendEntry(id, { kind: 'member', name }, text, thread)
}

/** The room log as `speaker: text`, which is what an assertion should read like. */
function transcript(id: string): string[] {
  return roomOf(id).log.map((entry) => `${entry.from.name}: ${entry.text}`)
}

function memberEntries(id: string): string[] {
  return roomOf(id)
    .log.filter((entry) => entry.from.kind === 'member')
    .map((entry) => entry.text)
}

/** Who was actually handed a turn, in order. */
function dispatched(): string[] {
  return runGroupTurn.mock.calls.map(([request]) => request.member)
}

function watermark(id: string, member: string, thread = THREAD): number | undefined {
  return roomOf(id).watermarks[`${thread}::${member}`]
}

/** Each member answers from its own queue; an exhausted queue passes. */
function script(turns: Record<string, GroupTurnResult[]>): void {
  runGroupTurn.mockImplementation(async ({ member }) => turns[member]?.shift() ?? PASS)
}

/** Nobody ever passes. Text is unique so the store's echo guard stays out of it. */
function everyoneTalks(): void {
  let line = 0

  runGroupTurn.mockImplementation(async ({ member }) => {
    line += 1
    return speaks(`${member} line ${line}`)
  })
}

beforeEach(() => {
  useGroupStore.setState({ ...pristine, rooms: {} })

  ensureGroupSession.mockReset().mockImplementation(async (_roomId, member) => handleFor(member))
  harvestGroupTurn.mockReset().mockResolvedValue(undefined)
  runGroupTurn.mockReset().mockResolvedValue(PASS)
})

describe('runGroupRounds', () => {
  it('cancels a drive for a room that is gone', async () => {
    await expect(runGroupRounds('r-missing', THREAD)).resolves.toBe('cancelled')

    expect(runGroupTurn).not.toHaveBeenCalled()
  })

  it('settles after one round when every member passes', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'morning all')
    store().setRunning(id, true)

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    // One pass each, then the room stops asking.
    expect(dispatched()).toEqual(['alice', 'bob', 'carol'])
    expect(transcript(id)).toEqual(['You: morning all'])

    const room = roomOf(id)
    expect(room.lastExit).toBe('settled')
    expect(room.running).toBe(false)
    expect(room.round).toBe(0)
    expect(room.turn).toBeNull()
  })

  it('publishes the member in flight and a 1-based round while a turn runs', async () => {
    const id = makeRoom(['alice', 'bob'])
    userSays(id, 'status?')

    const seen: Array<{ round: number; turn: string | null }> = []
    runGroupTurn.mockImplementation(async () => {
      const room = roomOf(id)
      seen.push({ round: room.round, turn: room.turn })
      return PASS
    })

    await runGroupRounds(id, THREAD)

    expect(seen).toEqual([
      { round: 1, turn: 'alice' },
      { round: 1, turn: 'bob' },
    ])
    expect(roomOf(id).round).toBe(0)
    expect(roomOf(id).turn).toBeNull()
  })

  it('dispatches on the live session id and persists the durable one', async () => {
    const id = makeRoom(['alice', 'bob'])
    userSays(id, 'status?')
    everyoneTalks()

    await runGroupRounds(id, THREAD)

    expect(roomOf(id).sessions).toEqual({ alice: 'stored-alice', bob: 'stored-bob' })
    expect(runGroupTurn.mock.calls[0]?.[0].sessionId).toBe('live-alice')

    // The stored key is what the next round resumes from — the short id is dead
    // by then.
    expect(ensureGroupSession).toHaveBeenNthCalledWith(1, id, 'alice', undefined)
    expect(ensureGroupSession).toHaveBeenNthCalledWith(3, id, 'alice', 'stored-alice')
  })

  it('appends one reply once and advances every watermark past it', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'who can take the schema?')
    script({ bob: [speaks('I can take it')] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(transcript(id)).toEqual(['You: who can take the schema?', 'bob: I can take it'])

    // Its own message counts as seen, or bob would be re-fed its own words.
    expect(watermark(id, 'bob')).toBe(2)
    expect(watermark(id, 'carol')).toBe(2)

    // alice took her turn before bob spoke, so she is owed exactly one more —
    // and after it she is level with the log rather than looping on it.
    expect(dispatched()).toEqual(['alice', 'bob', 'carol', 'alice'])
    expect(watermark(id, 'alice')).toBe(2)
  })

  it('stops at the message cap when nobody passes', async () => {
    const id = makeRoom(['m1', 'm2', 'm3', 'm4', 'm5', 'm6'])
    userSays(id, 'status?')
    everyoneTalks()

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('capped')

    expect(memberEntries(id)).toHaveLength(GROUP_MAX_MESSAGES)
    // The member that would have been the 11th is refused before dispatch.
    expect(dispatched()).toHaveLength(GROUP_MAX_MESSAGES)
    expect(roomOf(id).lastExit).toBe('capped')
    expect(roomOf(id).running).toBe(false)
  })

  it('stops at the round cap when the room keeps talking under the message cap', async () => {
    const roster = ['alice', 'bob', 'carol']
    const id = makeRoom(roster)
    userSays(id, 'status?')
    everyoneTalks()

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('capped')

    expect(dispatched()).toHaveLength(GROUP_MAX_ROUNDS * roster.length)
    expect(memberEntries(id)).toHaveLength(GROUP_MAX_ROUNDS * roster.length)
    expect(memberEntries(id).length).toBeLessThan(GROUP_MAX_MESSAGES)
    expect(roomOf(id).lastExit).toBe('capped')
  })

  it('narrows the round to the member the user mentioned', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, '@bob can you check the deploy?')
    script({ bob: [speaks('checking now')] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(dispatched()).toEqual(['bob'])
    expect(transcript(id)).toEqual(['You: @bob can you check the deploy?', 'bob: checking now'])
    expect(watermark(id, 'alice')).toBeUndefined()
    expect(watermark(id, 'carol')).toBeUndefined()
  })

  it('rotates the lead speaker every round', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    everyoneTalks()

    await runGroupRounds(id, THREAD)

    expect(dispatched()).toEqual([
      'alice', 'bob', 'carol',
      'bob', 'carol', 'alice',
      'carol', 'alice', 'bob',
    ])
  })

  it('never gives a held member a turn, and advances its watermark anyway', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    store().setHolds(id, { bob: { at: Date.now(), noted: false } })
    script({ alice: [speaks('shipping the fix')] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(dispatched()).not.toContain('bob')
    expect(memberEntries(id)).toEqual(['shipping the fix'])

    // The skip consumed bob's delta, so those same entries cannot re-trigger it.
    expect(watermark(id, 'bob')).toBe(roomOf(id).log.length)
    expect(roomOf(id).holds.bob?.noted).toBe(true)
  })

  it('notes a hold exactly once however many rounds skip that member', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    store().setHolds(id, { bob: { at: Date.now(), noted: false } })

    // alice and carol keep talking, so bob has a fresh delta to skip every round.
    everyoneTalks()

    const original = store().markHoldNoted
    const marked = vi.fn(original)
    useGroupStore.setState({ markHoldNoted: marked })

    const exit = await runGroupRounds(id, THREAD)
    useGroupStore.setState({ markHoldNoted: original })

    expect(exit).toBe('capped')
    expect(marked).toHaveBeenCalledTimes(1)
    expect(marked).toHaveBeenCalledWith(id, 'bob')
    expect(dispatched()).not.toContain('bob')
    expect(watermark(id, 'bob')).toBe(roomOf(id).log.length)
  })

  it('drops a reply when the epoch moved and a newer user entry landed in the thread', async () => {
    const id = makeRoom(['alice', 'bob'])
    userSays(id, 'first ask')

    runGroupTurn.mockImplementation(async ({ member }) => {
      if (member === 'alice') {
        // A second send lands while alice is thinking: same thread, new epoch.
        // Its own drive re-feeds alice the whole delta, so this reply would be
        // a duplicate rather than a late one.
        userSays(id, 'second ask')
        store().bumpEpoch(id)
      }

      return speaks(`${member} answered`)
    })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('cancelled')

    expect(transcript(id)).toEqual(['You: first ask', 'You: second ask'])
    expect(watermark(id, 'alice')).toBeUndefined()
    expect(dispatched()).toEqual(['alice'])

    // A superseded drive must not stamp its outcome over the live room.
    expect(roomOf(id).lastExit).toBeNull()
    expect(roomOf(id).turn).toBeNull()
  })

  it('still commits a reply when the newer send was in another thread', async () => {
    const id = makeRoom(['alice', 'bob'])
    userSays(id, 'first ask')

    runGroupTurn.mockImplementation(async ({ member }) => {
      // Bumps the epoch, but nothing in this thread will regenerate the reply,
      // so dropping it would lose finished work outright.
      userSays(id, 'unrelated', 'other-thread')
      store().bumpEpoch(id)
      return speaks(`${member} answered`)
    })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('cancelled')

    expect(transcript(id)).toEqual(['You: first ask', 'You: unrelated', 'alice: alice answered'])
    expect(dispatched()).toEqual(['alice'])
  })

  it('marks a stranded turn and skips that member as a responder next round', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    script({ alice: [STRANDED], bob: [speaks('on the deploy')] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    // The marker carries the baseline the TURN resolved (its session-transcript
    // length), not the room-log length the driver passed in. The two counters
    // are unrelated, and harvesting from the room-log one scans an empty range
    // and bins the finished answer.
    expect(roomOf(id).stranded.alice).toEqual({ before: STRANDED.before, thread: THREAD })
    expect(transcript(id)).toEqual(['You: status?', 'bob: on the deploy'])

    // Round two harvests alice from her durable key rather than re-prompting a
    // session that is still working.
    expect(dispatched()).toEqual(['alice', 'bob', 'carol'])
    expect(harvestGroupTurn).toHaveBeenCalledTimes(1)
    // Harvest reads from the SESSION baseline the marker stored, not the room log.
    expect(harvestGroupTurn).toHaveBeenCalledWith(id, 'alice', 'stored-alice', STRANDED.before)
  })

  it('delivers a harvested reply on the next round and clears the marker', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    script({ alice: [STRANDED], bob: [speaks('on the deploy')] })
    harvestGroupTurn.mockResolvedValue({ status: 'replied', before: 0, reply: 'schema is done' })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(transcript(id)).toEqual([
      'You: status?',
      'bob: on the deploy',
      'alice: schema is done',
    ])
    expect(roomOf(id).stranded).toEqual({})
    expect(watermark(id, 'alice')).toBe(3)
  })

  it('drops a stranded marker whose member has no stored session to harvest', async () => {
    const id = makeRoom(['alice', 'bob'])
    userSays(id, 'status?')
    script({ alice: [STRANDED], bob: [speaks('on it')] })
    ensureGroupSession.mockImplementation(async () => ({ sessionId: 'live', storedId: '' }))

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(roomOf(id).stranded).toEqual({})
    expect(harvestGroupTurn).not.toHaveBeenCalled()
  })

  it('grants a continuation turn to a member left with an unanswered handoff', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    // The handoff predates the user's latest send, so the mention parse that
    // picks responders never sees it — only the continuation check does.
    memberSays(id, 'bob', '@carol can you take the schema?')
    userSays(id, '@bob any update?')
    script({ carol: [speaks('taking the schema now')] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    // bob is the only responder in either round; carol speaks only because the
    // quiet round bought her one of the (bounded) continuation turns.
    expect(dispatched()).toEqual(['bob', 'carol', 'bob'])
    expect(transcript(id)).toEqual([
      'bob: @carol can you take the schema?',
      'You: @bob any update?',
      'carol: taking the schema now',
    ])
  })

  it('does not buy a continuation when a quiet round has no unanswered handoff', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    memberSays(id, 'bob', '@carol can you take the schema?')
    memberSays(id, 'carol', 'already done')
    userSays(id, '@bob any update?')

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(dispatched()).toEqual(['bob'])
    expect(memberEntries(id)).toEqual(['@carol can you take the schema?', 'already done'])
  })

  it('treats a failed turn as a pass rather than an abort', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    script({ alice: [FAILED] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(transcript(id)).toEqual(['You: status?'])
    // The room kept going, and alice's delta was still consumed.
    expect(dispatched()).toEqual(['alice', 'bob', 'carol'])
    expect(watermark(id, 'alice')).toBe(1)
    expect(roomOf(id).lastExit).toBe('settled')
  })

  it('keeps the room going when one member has no resolvable session', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    userSays(id, 'status?')
    ensureGroupSession.mockImplementation(async (_roomId, member) => {
      if (member === 'alice') throw new Error('gateway unreachable')
      return handleFor(member)
    })
    script({ bob: [speaks('I have it')] })

    await expect(runGroupRounds(id, THREAD)).resolves.toBe('settled')

    expect(dispatched()).not.toContain('alice')
    expect(transcript(id)).toEqual(['You: status?', 'bob: I have it'])
    expect(roomOf(id).lastExit).toBe('settled')
  })

  it('never re-prompts a stranded member during a continuation turn', async () => {
    const id = makeRoom(['alice', 'bob', 'carol'])
    // The handoff predates the last user send, so only the continuation check
    // sees it — carol is exactly the member a continuation would wake.
    memberSays(id, 'bob', '@carol can you take the schema?')
    userSays(id, '@bob any update?')

    // ...but carol's earlier turn is still running server-side: she holds a live
    // session and a marker, and the harvest reports she has not finished.
    useGroupStore.getState().setSession(id, 'carol', 'stored-carol')
    useGroupStore.getState().setStranded(id, 'carol', { before: 0, thread: THREAD })
    harvestGroupTurn.mockResolvedValue(undefined)

    await runGroupRounds(id, THREAD)

    // Dispatching her would prompt into that live session, and the gateway's
    // busy policy would interrupt the very long-running turn the stranded and
    // harvest machinery exists to protect.
    expect(dispatched()).not.toContain('carol')
    expect(roomOf(id).stranded.carol).toBeDefined()
  })

  it('harvests a marker left in an older thread instead of muting the member', async () => {
    const id = makeRoom(['alice', 'bob'])
    // alice was stranded in t1. Every send mints a NEW thread, so by the time a
    // round runs again her marker belongs to a conversation nobody is driving.
    useGroupStore.getState().setSession(id, 'alice', 'stored-alice')
    useGroupStore.getState().setStranded(id, 'alice', { before: 3, thread: 'old-thread' })
    harvestGroupTurn.mockResolvedValue({
      status: 'replied',
      reply: 'finished the migration',
      before: 3,
    })

    userSays(id, 'status?', THREAD)
    await runGroupRounds(id, THREAD)

    // The marker is consumed even though it belongs to another thread...
    expect(roomOf(id).stranded.alice).toBeUndefined()
    // ...the late answer lands in the thread it was actually produced for...
    const late = roomOf(id).log.find((entry) => entry.text === 'finished the migration')
    expect(late?.thread).toBe('old-thread')
    // ...and alice is not barred from speaking in the current one.
    expect(dispatched()).toContain('alice')
  })
})
