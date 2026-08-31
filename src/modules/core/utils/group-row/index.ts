import type { GroupRoom } from '../../types/groups'

/**
 * A room reduced to the five things a sidebar row can show.
 *
 * §1g's rule is that a group reuses "the same three trailing treatments a bot row
 * uses — timestamp, spinner, warn glyph, unread dot — so a group never invents a
 * signal of its own". This is where that equivalence is made literal: the shape
 * below is deliberately the shape `RosterEntry` already has, plus the two things
 * only a room can be (`speaking`, `needsYou`), so the row component can render
 * either without branching on which it got.
 *
 * Everything here is derived from the log rather than stored. A stored flag would
 * drift the moment a round committed a reply while the sidebar was unmounted.
 */
export interface GroupRow {
  id: string
  name: string
  members: string[]
  subtitle: string
  /** Sort key, shared with `RosterEntry.activityMs` so the two interleave. */
  activityMs: number
  /** The member whose model call is in flight, if any. */
  speaking: string | null
  /** The member waiting on a decision, if any. */
  needsYou: string | null
}

/**
 * Who is blocked on the user, or null.
 *
 * A member that wrote `@user` is asking for a decision, and it stops asking the
 * moment the user speaks again — so this walks back from the tail and stops at
 * the first user entry. Deriving it means the flag cannot drift out of sync with
 * the transcript, and it is why nothing needs clearing when the user replies.
 */
export function groupNeedsYou(room: GroupRoom): string | null {
  for (let i = room.log.length - 1; i >= 0; i -= 1) {
    const entry = room.log[i]
    if (!entry) continue
    if (entry.from.kind === 'user') return null
    if (/@user\b/i.test(entry.text)) return entry.from.name
  }

  return null
}

/**
 * The room's last activity.
 *
 * Falls back to `createdAt` so a brand-new room sorts to the top of Team — §1d
 * requires the row to be "already in Team, top of the list" before anyone has
 * spoken, and a zero here would bury it under every room that ever ran.
 */
export function groupActivityMs(room: GroupRoom): number {
  return room.log[room.log.length - 1]?.at ?? room.createdAt
}

/**
 * The one line under the room's name.
 *
 * Four forms, in priority order, because they answer different questions and
 * only one can be on screen: who is speaking now, who is waiting on you, that
 * nobody has spoken, and otherwise who said what last.
 */
export function groupSubtitle(room: GroupRoom): string {
  if (room.turn) return `${room.turn} is typing…`

  const blocked = groupNeedsYou(room)
  // §1g: "in a room of six 'someone needs you' is not an answer" — so the member
  // is named. The canvas's own copy carries a task ("…before sending") that no
  // template can know, so the generic form stops at the part that is always true.
  if (blocked) return `${blocked} needs a yes.`

  const last = room.log[room.log.length - 1]
  if (!last) return `${room.members.length} members · nobody has spoken yet`

  return `${last.from.name}: ${last.text}`
}

export function toGroupRow(room: GroupRoom): GroupRow {
  return {
    id: room.id,
    name: room.name,
    members: room.members,
    subtitle: groupSubtitle(room),
    activityMs: groupActivityMs(room),
    speaking: room.turn,
    needsYou: groupNeedsYou(room),
  }
}
