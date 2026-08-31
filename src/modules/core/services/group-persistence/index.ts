import type { GroupRoom } from '@/modules/core/types/groups'

/**
 * Rooms live in this browser and nowhere else.
 *
 * **There is no backend for them, and that is not an oversight to be fixed
 * later.** A Hermes profile stores `description` and `description_auto` and
 * nothing more — `write_profile_meta` rewrites `profile.yaml` from that
 * whitelist, so any room key smuggled in there is dropped by the next
 * description edit. There is no rooms table, no room endpoint, and no user
 * record to hang one off. The desktop app gets cross-device rooms by mirroring
 * them into its own plugin storage and a gateway `ui_meta` projection; a
 * browser tab has neither.
 *
 * So a room is a property of this device, like the theme and the identity
 * overrides. The UI must say so rather than imply a teammate on another machine
 * can see the same room.
 *
 * Only the durable half is written. `epoch`, `running`, `turn` and `stranded`
 * describe a drive that is already over by the time the page reloads, and
 * restoring them would resurrect a room that believes it is mid-round.
 */

const STORAGE_KEY = 'employees:group-rooms'

type DurableRoom = Pick<
  GroupRoom,
  'createdAt' | 'holds' | 'id' | 'log' | 'members' | 'name' | 'sessions' | 'watermarks'
>

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Rehydrate one room, filling the runtime half with its resting values. */
function reviveRoom(value: unknown): GroupRoom | null {
  if (!isRecord(value)) return null

  const id = typeof value.id === 'string' ? value.id : ''
  const name = typeof value.name === 'string' ? value.name : ''
  if (!id || !name) return null

  const members = Array.isArray(value.members)
    ? value.members.filter((member): member is string => typeof member === 'string')
    : []

  return {
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    epoch: 0,
    holds: isRecord(value.holds) ? (value.holds as GroupRoom['holds']) : {},
    id,
    log: Array.isArray(value.log) ? (value.log as GroupRoom['log']) : [],
    members,
    name,
    lastExit: null,
    round: 0,
    running: false,
    sessions: isRecord(value.sessions) ? (value.sessions as GroupRoom['sessions']) : {},
    stranded: {},
    turn: null,
    watermarks: isRecord(value.watermarks)
      ? (value.watermarks as GroupRoom['watermarks'])
      : {},
  }
}

export function loadGroupRooms(): Record<string, GroupRoom> {
  if (typeof localStorage === 'undefined') return {}

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (!isRecord(parsed)) return {}

    const rooms: Record<string, GroupRoom> = {}
    for (const value of Object.values(parsed)) {
      const room = reviveRoom(value)
      if (room) rooms[room.id] = room
    }
    return rooms
  } catch {
    // Corrupt JSON or storage disabled. An empty rooms list beats a blank page.
    return {}
  }
}

export function saveGroupRooms(rooms: Record<string, GroupRoom>): void {
  if (typeof localStorage === 'undefined') return

  try {
    // Start from what is on disk, not from an empty object. Another tab may
    // have created a room since this one hydrated, and a whole-map write would
    // delete it. Rooms this tab knows about win; ones it has never heard of
    // survive. (A room deleted here is genuinely gone — `deleteRoom` removes it
    // from the map this tab holds, and the merge below only re-adds ids that
    // were never in it.)
    const durable: Record<string, DurableRoom> = {}
    const onDisk = loadGroupRooms()
    for (const [id, room] of Object.entries(onDisk)) {
      if (!(id in rooms)) {
        durable[id] = {
          createdAt: room.createdAt,
          holds: room.holds,
          id: room.id,
          log: room.log,
          members: room.members,
          name: room.name,
          sessions: room.sessions,
          watermarks: room.watermarks,
        }
      }
    }

    for (const [id, room] of Object.entries(rooms)) {
      durable[id] = {
        createdAt: room.createdAt,
        holds: room.holds,
        id: room.id,
        log: room.log,
        members: room.members,
        name: room.name,
        sessions: room.sessions,
        watermarks: room.watermarks,
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(durable))
  } catch {
    // Private browsing or a full quota. Losing a room must not break the send
    // that was in progress when the write failed.
  }
}
