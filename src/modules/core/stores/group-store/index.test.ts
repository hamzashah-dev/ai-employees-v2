import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { groupWatermarkKey, uniqueGroupRoomName, useGroupStore } from './index'
import { GROUP_HISTORY_LIMIT, GROUP_LEGACY_THREAD } from '../../constants/groups'
import type { GroupMessageAuthor, GroupRoom } from '../../types/groups'

const store = () => useGroupStore.getState()

/** The retained window `trimGroupLog` defaults to. */
const RETAINED = GROUP_HISTORY_LIMIT * 4

function roomOf(id: string): GroupRoom {
  const room = useGroupStore.getState().rooms[id]

  if (!room) {
    throw new Error(`no room ${id}`)
  }

  return room
}

function member(name: string): GroupMessageAuthor {
  return { kind: 'member', name }
}

function user(name = 'You'): GroupMessageAuthor {
  return { kind: 'user', name }
}

beforeEach(() => {
  useGroupStore.setState({ rooms: {} })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('uniqueGroupRoomName', () => {
  it('leaves a free name alone', () => {
    expect(uniqueGroupRoomName('Ops', new Set())).toBe('Ops')
  })

  it('walks the numeric suffix past every taken name', () => {
    expect(uniqueGroupRoomName('Ops', new Set(['Ops']))).toBe('Ops 2')
    expect(uniqueGroupRoomName('Ops', new Set(['Ops', 'Ops 2', 'Ops 3']))).toBe('Ops 4')
  })

  it('does not confuse a taken suffix with a taken base', () => {
    expect(uniqueGroupRoomName('Ops', new Set(['Ops 2']))).toBe('Ops')
  })
})

describe('groupWatermarkKey', () => {
  it('scopes a member to one thread', () => {
    expect(groupWatermarkKey('t1', 'ana')).toBe('t1::ana')
    expect(groupWatermarkKey('t2', 'ana')).not.toBe(groupWatermarkKey('t1', 'ana'))
  })
})

describe('createRoom', () => {
  it('seeds every field of a room and returns its id', () => {
    const id = store().createRoom('Launch', ['ana', 'bo'])
    const room = roomOf(id)

    expect(id).toMatch(/^r-/)
    expect(room).toMatchObject({
      id,
      name: 'Launch',
      members: ['ana', 'bo'],
      log: [],
      watermarks: {},
      sessions: {},
      holds: {},
      stranded: {},
      epoch: 0,
      running: false,
      turn: null,
    })
    expect(room.createdAt).toBeGreaterThan(0)
  })

  it('mints a distinct id per room', () => {
    const a = store().createRoom('Ops', ['ana'])
    const b = store().createRoom('Ops', ['bo'])

    expect(a).not.toBe(b)
    expect(Object.keys(useGroupStore.getState().rooms)).toHaveLength(2)
  })

  it('suffixes a colliding name rather than rejecting it', () => {
    const a = store().createRoom('Ops', ['ana'])
    const b = store().createRoom('Ops', ['bo'])
    const c = store().createRoom('Ops', ['cy'])

    expect(roomOf(a).name).toBe('Ops')
    expect(roomOf(b).name).toBe('Ops 2')
    expect(roomOf(c).name).toBe('Ops 3')
  })

  it('trims before deciding a name has collided', () => {
    store().createRoom('Ops', ['ana'])
    const b = store().createRoom('  Ops  ', ['bo'])

    expect(roomOf(b).name).toBe('Ops 2')
  })

  it('falls back to a placeholder for a blank name', () => {
    const id = store().createRoom('   ', ['ana'])

    expect(roomOf(id).name).toBe('Group')
  })

  it('copies the members array instead of aliasing the caller’s', () => {
    const members = ['ana', 'bo']
    const id = store().createRoom('Ops', members)
    members.push('cy')

    expect(roomOf(id).members).toEqual(['ana', 'bo'])
  })

  it('still mints an id where crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {})

    const a = store().createRoom('Ops', ['ana'])
    const b = store().createRoom('Ops', ['bo'])

    expect(a).toMatch(/^r-.+/)
    expect(a).not.toBe(b)
  })
})

describe('deleteRoom / renameRoom / setMembers', () => {
  it('drops only the named room', () => {
    const a = store().createRoom('Ops', ['ana'])
    const b = store().createRoom('Launch', ['bo'])

    store().deleteRoom(a)

    expect(useGroupStore.getState().rooms[a]).toBeUndefined()
    expect(roomOf(b).name).toBe('Launch')
  })

  it('leaves the map untouched when the id is unknown', () => {
    store().createRoom('Ops', ['ana'])
    const before = useGroupStore.getState().rooms

    store().deleteRoom('r-nope')

    expect(useGroupStore.getState().rooms).toBe(before)
  })

  it('renames a room', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().renameRoom(id, '  Weekly sync  ')

    expect(roomOf(id).name).toBe('Weekly sync')
  })

  it('ignores a blank rename', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().renameRoom(id, '   ')

    expect(roomOf(id).name).toBe('Ops')
  })

  it('replaces the roster with a copy', () => {
    const id = store().createRoom('Ops', ['ana'])
    const next = ['bo', 'cy']

    store().setMembers(id, next)
    next.push('dee')

    expect(roomOf(id).members).toEqual(['bo', 'cy'])
  })
})

describe('appendEntry', () => {
  it('appends and returns the entry', () => {
    const id = store().createRoom('Ops', ['ana'])
    const entry = store().appendEntry(id, member('ana'), '  on it  ', 't1')

    expect(entry).not.toBeNull()
    expect(entry?.text).toBe('on it')
    expect(entry?.thread).toBe('t1')
    expect(entry?.from).toEqual({ kind: 'member', name: 'ana' })
    expect(entry?.id).toBeTruthy()
    expect(roomOf(id).log).toEqual([entry])
  })

  it('returns null for empty or whitespace-only text', () => {
    const id = store().createRoom('Ops', ['ana'])

    expect(store().appendEntry(id, member('ana'), '', 't1')).toBeNull()
    expect(store().appendEntry(id, member('ana'), '   \n ', 't1')).toBeNull()
    expect(roomOf(id).log).toHaveLength(0)
  })

  it('returns null for an unknown room', () => {
    expect(store().appendEntry('r-nope', member('ana'), 'hello', 't1')).toBeNull()
  })

  it('files a thread-less entry under the legacy thread', () => {
    const id = store().createRoom('Ops', ['ana'])
    const entry = store().appendEntry(id, member('ana'), 'hello', '')

    expect(entry?.thread).toBe(GROUP_LEGACY_THREAD)
  })

  it('does not alias the author object it was handed', () => {
    const id = store().createRoom('Ops', ['ana'])
    const author = member('ana')
    const entry = store().appendEntry(id, author, 'hello', 't1')

    author.name = 'impostor'

    expect(entry?.from.name).toBe('ana')
  })

  it('drops a byte-identical member echo and hands back the entry already logged', () => {
    const id = store().createRoom('Ops', ['ana'])
    const first = store().appendEntry(id, member('ana'), 'done', 't1')
    const second = store().appendEntry(id, member('ana'), 'done', 't1')

    expect(second).toBe(first)
    expect(roomOf(id).log).toHaveLength(1)
  })

  it('treats the trimmed text as the comparison, not the raw string', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().appendEntry(id, member('ana'), 'done', 't1')
    store().appendEntry(id, member('ana'), '  done\n', 't1')

    expect(roomOf(id).log).toHaveLength(1)
  })

  it('keeps a repeat that is not adjacent within the thread', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().appendEntry(id, member('ana'), 'done', 't1')
    store().appendEntry(id, member('bo'), 'nice', 't1')
    store().appendEntry(id, member('ana'), 'done', 't1')

    expect(roomOf(id).log).toHaveLength(3)
  })

  it('keeps an identical line from a different member', () => {
    const id = store().createRoom('Ops', ['ana', 'bo'])
    store().appendEntry(id, member('ana'), 'done', 't1')
    store().appendEntry(id, member('bo'), 'done', 't1')

    expect(roomOf(id).log).toHaveLength(2)
  })

  it('keeps an identical line in a different thread', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().appendEntry(id, member('ana'), 'done', 't1')
    store().appendEntry(id, member('ana'), 'done', 't2')

    expect(roomOf(id).log).toHaveLength(2)
  })

  it('never drops a repeated user entry — a person meant it twice', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().appendEntry(id, user(), 'ok', 't1')
    store().appendEntry(id, user(), 'ok', 't1')

    expect(roomOf(id).log).toHaveLength(2)
  })

  it('lets an identical member line through once the echo window has passed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    const id = store().createRoom('Ops', ['ana'])
    store().appendEntry(id, member('ana'), 'still working', 't1')

    vi.advanceTimersByTime(660_000)
    store().appendEntry(id, member('ana'), 'still working', 't1')

    expect(roomOf(id).log).toHaveLength(2)
  })

  it('bounds the log and shifts watermarks with it', () => {
    const id = store().createRoom('Ops', ['ana', 'bo'])

    store().setWatermark(id, 't1', 'ana', 10)
    store().setWatermark(id, 't1', 'bo', 0)

    for (let i = 0; i < RETAINED + 3; i += 1) {
      store().appendEntry(id, member('ana'), `note ${i}`, 't1')
    }

    const room = roomOf(id)

    expect(room.log).toHaveLength(RETAINED)
    // The three oldest entries fell off the front, so every index into the log
    // moved down by three.
    expect(room.log[0]?.text).toBe('note 3')
    expect(room.watermarks[groupWatermarkKey('t1', 'ana')]).toBe(7)
    // A member whose unread delta was itself trimmed clamps at the front
    // rather than going negative.
    expect(room.watermarks[groupWatermarkKey('t1', 'bo')]).toBe(0)
  })
})

describe('watermark and session bookkeeping', () => {
  it('keys a watermark by thread and member together', () => {
    const id = store().createRoom('Ops', ['ana'])

    store().setWatermark(id, 't1', 'ana', 4)
    store().setWatermark(id, 't2', 'ana', 9)

    expect(roomOf(id).watermarks).toEqual({ 't1::ana': 4, 't2::ana': 9 })
  })

  it('clamps a negative index and truncates a fractional one', () => {
    const id = store().createRoom('Ops', ['ana'])

    store().setWatermark(id, 't1', 'ana', -5)
    expect(roomOf(id).watermarks['t1::ana']).toBe(0)

    store().setWatermark(id, 't1', 'ana', 3.9)
    expect(roomOf(id).watermarks['t1::ana']).toBe(3)
  })

  it('records one gateway session per member', () => {
    const id = store().createRoom('Ops', ['ana', 'bo'])

    store().setSession(id, 'ana', 'sess-a')
    store().setSession(id, 'bo', 'sess-b')
    store().setSession(id, 'ana', 'sess-a2')

    expect(roomOf(id).sessions).toEqual({ ana: 'sess-a2', bo: 'sess-b' })
  })

  it('ignores writes to a room that is gone', () => {
    store().setWatermark('r-nope', 't1', 'ana', 3)
    store().setSession('r-nope', 'ana', 'sess-a')
    store().setRunning('r-nope', true)
    store().setTurn('r-nope', 'ana')

    expect(useGroupStore.getState().rooms).toEqual({})
  })
})

describe('holds', () => {
  it('replaces the hold map wholesale, with a copy', () => {
    const id = store().createRoom('Ops', ['ana', 'bo'])
    const holds = { ana: { at: 1_000, noted: false } }

    store().setHolds(id, holds)
    holds.ana = { at: 2_000, noted: true }

    expect(roomOf(id).holds).toEqual({ ana: { at: 1_000, noted: false } })

    store().setHolds(id, { bo: { at: 3_000, noted: false } })

    expect(roomOf(id).holds).toEqual({ bo: { at: 3_000, noted: false } })
  })

  it('notes a hold exactly once', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().setHolds(id, { ana: { at: 1_000, noted: false } })

    store().markHoldNoted(id, 'ana')
    expect(roomOf(id).holds['ana']).toEqual({ at: 1_000, noted: true })

    // Already noted: the room reference must not churn, or the activity feed
    // re-renders for a state change that did not happen.
    const settled = roomOf(id)
    store().markHoldNoted(id, 'ana')
    expect(roomOf(id)).toBe(settled)
  })

  it('is a no-op for a member that was never held', () => {
    const id = store().createRoom('Ops', ['ana'])
    const before = roomOf(id)

    store().markHoldNoted(id, 'ana')

    expect(roomOf(id)).toBe(before)
    expect(roomOf(id).holds).toEqual({})
  })
})

describe('stranded turns', () => {
  it('records and clears a marker per member', () => {
    const id = store().createRoom('Ops', ['ana', 'bo'])

    store().setStranded(id, 'ana', { before: 7, thread: 't1' })
    store().setStranded(id, 'bo', { before: 2, thread: 't1' })

    expect(roomOf(id).stranded).toEqual({
      ana: { before: 7, thread: 't1' },
      bo: { before: 2, thread: 't1' },
    })

    store().setStranded(id, 'ana', null)

    expect(roomOf(id).stranded).toEqual({ bo: { before: 2, thread: 't1' } })
  })
})

describe('epoch, running and turn', () => {
  it('returns the new epoch, in order', () => {
    const id = store().createRoom('Ops', ['ana'])

    expect(store().bumpEpoch(id)).toBe(1)
    expect(store().bumpEpoch(id)).toBe(2)
    expect(store().bumpEpoch(id)).toBe(3)
    expect(roomOf(id).epoch).toBe(3)
  })

  it('bumps rooms independently', () => {
    const a = store().createRoom('Ops', ['ana'])
    const b = store().createRoom('Launch', ['bo'])

    store().bumpEpoch(a)
    store().bumpEpoch(a)

    expect(roomOf(a).epoch).toBe(2)
    expect(roomOf(b).epoch).toBe(0)
  })

  it('reports 0 for a room that is gone, which no live room can return', () => {
    expect(store().bumpEpoch('r-nope')).toBe(0)
  })

  it('tracks the running flag and the member currently speaking', () => {
    const id = store().createRoom('Ops', ['ana'])

    store().setRunning(id, true)
    store().setTurn(id, 'ana')
    expect(roomOf(id)).toMatchObject({ running: true, turn: 'ana' })

    store().setTurn(id, null)
    store().setRunning(id, false)
    expect(roomOf(id)).toMatchObject({ running: false, turn: null })
  })
})

describe('immutability', () => {
  it('leaves the previous room object untouched on append', () => {
    const id = store().createRoom('Ops', ['ana'])
    const before = roomOf(id)
    const beforeLog = before.log

    store().appendEntry(id, member('ana'), 'hello', 't1')

    expect(before.log).toBe(beforeLog)
    expect(before.log).toHaveLength(0)
    expect(roomOf(id)).not.toBe(before)
    expect(roomOf(id).log).toHaveLength(1)
  })

  it('leaves the previous watermarks, sessions, holds and stranded maps untouched', () => {
    const id = store().createRoom('Ops', ['ana'])
    store().setWatermark(id, 't1', 'ana', 1)
    store().setSession(id, 'ana', 'sess-a')
    store().setHolds(id, { ana: { at: 1_000, noted: false } })
    store().setStranded(id, 'ana', { before: 1, thread: 't1' })

    const before = roomOf(id)
    const snapshot = {
      watermarks: before.watermarks,
      sessions: before.sessions,
      holds: before.holds,
      stranded: before.stranded,
      hold: before.holds['ana'],
    }

    store().setWatermark(id, 't1', 'ana', 5)
    store().setSession(id, 'ana', 'sess-b')
    store().markHoldNoted(id, 'ana')
    store().setStranded(id, 'ana', null)

    expect(before.watermarks).toBe(snapshot.watermarks)
    expect(before.watermarks['t1::ana']).toBe(1)
    expect(before.sessions).toBe(snapshot.sessions)
    expect(before.sessions['ana']).toBe('sess-a')
    expect(before.holds).toBe(snapshot.holds)
    expect(snapshot.hold?.noted).toBe(false)
    expect(before.stranded).toBe(snapshot.stranded)
    expect(before.stranded['ana']).toEqual({ before: 1, thread: 't1' })
  })

  it('leaves the previous rooms map untouched on create and delete', () => {
    const a = store().createRoom('Ops', ['ana'])
    const before = useGroupStore.getState().rooms

    const b = store().createRoom('Launch', ['bo'])

    expect(before[b]).toBeUndefined()
    expect(Object.keys(before)).toEqual([a])

    const afterCreate = useGroupStore.getState().rooms
    store().deleteRoom(a)

    expect(Object.keys(afterCreate).sort()).toEqual([a, b].sort())
  })

  it('leaves the previous room object untouched on rename and roster change', () => {
    const id = store().createRoom('Ops', ['ana'])
    const before = roomOf(id)
    const beforeMembers = before.members

    store().renameRoom(id, 'Weekly sync')
    store().setMembers(id, ['bo'])

    expect(before.name).toBe('Ops')
    expect(before.members).toBe(beforeMembers)
    expect(before.members).toEqual(['ana'])
  })
})
