import type { GroupMessage } from '@/modules/core/types/groups'
import { parseGroupMentions } from '../parse-mentions'

/**
 * Members a teammate called on who never took a turn afterwards — the
 * unresolved-handoff detector the round loop consults before it settles.
 *
 * A mention inside a member's reply only reaches the *next* round's responder
 * selection, and the loop is allowed to exit before that round happens: it
 * stops as soon as nobody spoke, and every member with no unread delta is
 * skipped. So a room can go quiet with "@alice can you take the schema?" as its
 * last word and alice never asked. Whatever this returns is owed a
 * continuation turn.
 *
 * Only member-to-member handoffs can strand. A user send re-drives the whole
 * roster on its own, so a mention the *user* wrote is answered by the round
 * that send starts, and counting it here would buy a continuation for work
 * already scheduled.
 *
 * Ordering is by ARRAY INDEX in the thread-scoped log, never by entry id: ids
 * are minted per entry and carry no order, and "answered *after* the citing
 * message" is a statement about position in the log and nothing else.
 */
export function unaddressedGroupMentions(log: GroupMessage[], members: string[], thread: string): string[] {
  const scoped = log.filter((entry) => entry.thread === thread)

  /** member → index of the entry that most recently called on it. */
  const citedAt = new Map<string, number>()
  /** member → index of its own most recent entry. */
  const lastPostAt = new Map<string, number>()

  scoped.forEach((entry, index) => {
    if (entry.from.kind !== 'member') return

    lastPostAt.set(entry.from.name, index)

    for (const cited of parseGroupMentions(entry.text, members).mentioned) {
      // A member tagging itself is thinking out loud, not handing off.
      if (cited !== entry.from.name) citedAt.set(cited, index)
    }
  })

  // Any turn counts as an answer, whatever it said — a member that spoke after
  // being called on has had its chance, and a pass is a legitimate answer.
  return [...citedAt.entries()]
    .filter(([member, citedIndex]) => {
      const answeredIndex = lastPostAt.get(member)

      return answeredIndex === undefined || answeredIndex <= citedIndex
    })
    .map(([member]) => member)
}
