import { create } from 'zustand'
import { GROUP_LEGACY_THREAD } from '../../constants/groups'
import type {
  GroupHold,
  GroupMessage,
  GroupMessageAuthor,
  GroupRoom,
  GroupRoundExit,
  GroupStrandedTurn,
} from '../../types/groups'
import { trimGroupLog } from '../../utils/trim-group-log'

/**
 * Every group room the user has, and nothing else.
 *
 * This store is deliberately inert: it holds rooms and applies pure
 * transitions to them. Dispatching a turn, polling the gateway and deciding
 * who speaks next all live above it, because a round is a long-lived async
 * process and a store that owned one could not be reasoned about — or tested —
 * without a socket. The round driver reads a snapshot, does its work, and
 * commits through these actions.
 *
 * Ported from the desktop Bot Mode plugin's `$groupChats` atom. Two
 * simplifications: a member is always a local profile name (the desktop's
 * source-qualified descriptors exist only to address bots on another machine),
 * and nothing is persisted here — durability is a separate concern layered on
 * top rather than baked into the mutation path.
 */

/**
 * How recently a byte-identical member reply must have landed to count as an
 * echo rather than a member genuinely repeating itself. Ten minutes is the
 * desktop's value: comfortably longer than any double-commit race, far shorter
 * than a room's lifetime.
 */
const GROUP_ECHO_WINDOW_MS = 600_000

/**
 * Watermarks are per *thread* per member, not per member: two conversations in
 * the same room advance independently, and a member joining thread B must not
 * inherit how far it had read in thread A.
 */
export function groupWatermarkKey(thread: string, member: string): string {
  return `${thread}::${member}`
}

/**
 * `crypto.randomUUID` is unavailable on insecure origins and in some test
 * runners, and an id collision here silently merges two rooms, so the fallback
 * still has to be practically unique rather than merely convenient.
 */
function randomId(): string {
  const source = globalThis.crypto

  if (source && typeof source.randomUUID === 'function') {
    return source.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

/**
 * Room names are user-facing labels and collide freely; the id is what the
 * rest of the system keys on. Suffixing a collision with ` 2`, ` 3`, … keeps
 * the sidebar readable without asking the user to resolve anything. The loop
 * always terminates: `taken` is finite, so some integer is free.
 */
export function uniqueGroupRoomName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    return base
  }

  let n = 2
  let candidate = `${base} ${n}`

  while (taken.has(candidate)) {
    n += 1
    candidate = `${base} ${n}`
  }

  return candidate
}

/** The most recent entry belonging to `thread`, ignoring interleaved threads. */
function lastEntryInThread(log: GroupMessage[], thread: string): GroupMessage | undefined {
  for (let i = log.length - 1; i >= 0; i -= 1) {
    const entry = log[i]

    if (entry?.thread === thread) {
      return entry
    }
  }

  return undefined
}

/**
 * Whether this append is a duplicate commit of the entry already at the end of
 * the thread.
 *
 * Insurance against a residual double-commit path — a superseded round and a
 * fresh one both committing the same member reply — which lands back-to-back
 * and byte-identical. User entries are never touched: a person sending "ok"
 * twice means it twice.
 */
function isMemberEcho(
  previous: GroupMessage | undefined,
  from: GroupMessageAuthor,
  text: string,
  at: number,
): boolean {
  if (!previous || from.kind !== 'member' || previous.from.kind !== 'member') {
    return false
  }

  if (previous.from.name !== from.name) {
    return false
  }

  if (at - previous.at > GROUP_ECHO_WINDOW_MS) {
    return false
  }

  return previous.text === text
}

/**
 * Replace one room through `mutate`, leaving the map alone when the room is
 * gone or the mutation was a no-op. Returning the identical `rooms` reference
 * is what keeps a redundant action from re-rendering every subscriber.
 */
function patchRooms(
  rooms: Record<string, GroupRoom>,
  id: string,
  mutate: (room: GroupRoom) => GroupRoom,
): Record<string, GroupRoom> {
  const room = rooms[id]

  if (!room) {
    return rooms
  }

  const next = mutate(room)

  return next === room ? rooms : { ...rooms, [id]: next }
}

interface GroupStore {
  rooms: Record<string, GroupRoom>

  createRoom: (name: string, members: string[]) => string
  deleteRoom: (id: string) => void
  renameRoom: (id: string, name: string) => void
  setMembers: (id: string, members: string[]) => void
  appendEntry: (
    id: string,
    from: GroupMessageAuthor,
    text: string,
    thread: string,
  ) => GroupMessage | null
  setWatermark: (id: string, thread: string, member: string, index: number) => void
  setSession: (id: string, member: string, sessionId: string) => void
  setHolds: (id: string, holds: Record<string, GroupHold>) => void
  markHoldNoted: (id: string, member: string) => void
  setStranded: (id: string, member: string, marker: GroupStrandedTurn | null) => void
  bumpEpoch: (id: string) => number
  setRunning: (id: string, running: boolean) => void
  setTurn: (id: string, member: string | null) => void
  setRound: (id: string, round: number) => void
  setExit: (id: string, exit: GroupRoundExit | null) => void
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  rooms: {},

  createRoom: (name, members) => {
    const id = `r-${randomId()}`
    const taken = new Set(Object.values(get().rooms).map((room) => room.name))
    const room: GroupRoom = {
      id,
      // Trimmed before the collision check, or ' Ops' and 'Ops ' read as
      // distinct rooms in the store and identical ones in the sidebar.
      name: uniqueGroupRoomName(name.trim() || 'Group', taken),
      members: [...members],
      log: [],
      watermarks: {},
      sessions: {},
      holds: {},
      stranded: {},
      epoch: 0,
      running: false,
      turn: null,
      round: 0,
      lastExit: null,
      createdAt: Date.now(),
    }

    set((state) => ({ rooms: { ...state.rooms, [id]: room } }))

    return id
  },

  deleteRoom: (id) =>
    set((state) => {
      if (!state.rooms[id]) {
        return state
      }

      const rooms = { ...state.rooms }
      delete rooms[id]

      return { rooms }
    }),

  renameRoom: (id, name) =>
    set((state) => {
      const trimmed = name.trim()

      // A blank name would render as an unclickable gap in the sidebar, so an
      // empty rename keeps the old one rather than committing the emptiness.
      if (!trimmed) {
        return state
      }

      return { rooms: patchRooms(state.rooms, id, (room) => ({ ...room, name: trimmed })) }
    }),

  setMembers: (id, members) =>
    set((state) => ({
      rooms: patchRooms(state.rooms, id, (room) => ({ ...room, members: [...members] })),
    })),

  appendEntry: (id, from, text, thread) => {
    const room = get().rooms[id]

    if (!room) {
      return null
    }

    const body = text.trim()

    if (!body) {
      return null
    }

    const at = Date.now()
    const inThread = thread || GROUP_LEGACY_THREAD
    const previous = lastEntryInThread(room.log, inThread)

    // The echo's own entry is already the tail of the thread, so hand that back
    // rather than null: a caller that needs the message id to advance a
    // watermark gets the one that actually landed, and the log does not grow.
    if (isMemberEcho(previous, from, body, at)) {
      return previous ?? null
    }

    const entry: GroupMessage = {
      id: randomId(),
      at,
      // Copied, not aliased — a caller reusing one author object across a round
      // could otherwise rewrite who said what after the fact.
      from: { kind: from.kind, name: from.name },
      text: body,
      thread: inThread,
    }

    const bounded = trimGroupLog([...room.log, entry], room.watermarks)

    set((state) => ({
      rooms: patchRooms(state.rooms, id, (current) => ({
        ...current,
        log: bounded.log,
        watermarks: bounded.watermarks,
      })),
    }))

    return entry
  },

  setWatermark: (id, thread, member, index) =>
    set((state) => ({
      rooms: patchRooms(state.rooms, id, (room) => ({
        ...room,
        watermarks: {
          ...room.watermarks,
          [groupWatermarkKey(thread, member)]: Math.max(0, Math.trunc(index)),
        },
      })),
    })),

  setSession: (id, member, sessionId) =>
    set((state) => ({
      rooms: patchRooms(state.rooms, id, (room) => ({
        ...room,
        sessions: { ...room.sessions, [member]: sessionId },
      })),
    })),

  setHolds: (id, holds) =>
    set((state) => ({
      rooms: patchRooms(state.rooms, id, (room) => ({ ...room, holds: { ...holds } })),
    })),

  markHoldNoted: (id, member) =>
    set((state) => ({
      rooms: patchRooms(state.rooms, id, (room) => {
        const hold = room.holds[member]

        // Nothing to note for a member that was never held, and re-noting an
        // already-noted hold would churn the reference for no change.
        if (!hold || hold.noted) {
          return room
        }

        return { ...room, holds: { ...room.holds, [member]: { ...hold, noted: true } } }
      }),
    })),

  setStranded: (id, member, marker) =>
    set((state) => ({
      rooms: patchRooms(state.rooms, id, (room) => {
        const stranded = { ...room.stranded }

        if (marker) {
          stranded[member] = marker
        } else {
          delete stranded[member]
        }

        return { ...room, stranded }
      }),
    })),

  bumpEpoch: (id) => {
    const room = get().rooms[id]

    // 0 is unambiguous as "no such room": a bump always lands on 1 or higher,
    // so a caller comparing a turn's epoch against this can never mistake a
    // deleted room for a still-current one.
    if (!room) {
      return 0
    }

    const epoch = room.epoch + 1

    set((state) => ({ rooms: patchRooms(state.rooms, id, (current) => ({ ...current, epoch })) }))

    return epoch
  },

  setRunning: (id, running) =>
    set((state) => ({ rooms: patchRooms(state.rooms, id, (room) => ({ ...room, running })) })),

  setTurn: (id, member) =>
    set((state) => ({ rooms: patchRooms(state.rooms, id, (room) => ({ ...room, turn: member })) })),

  setRound: (id, round) =>
    set((state) => ({ rooms: patchRooms(state.rooms, id, (room) => ({ ...room, round })) })),

  setExit: (id, exit) =>
    set((state) => ({ rooms: patchRooms(state.rooms, id, (room) => ({ ...room, lastExit: exit })) })),
}))
