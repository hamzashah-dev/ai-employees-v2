import type { GroupMessage } from '@/modules/core/types/groups'
import { parseGroupMentions } from '../parse-mentions'

/**
 * Who takes a turn this round.
 *
 * The window is everything the room has said since the user last spoke — not
 * just the user's own line — because a member handing off with `@alice` mid-
 * round has to pull Alice in without the user repeating themselves. It is
 * recomputed every round for the same reason.
 *
 * No user entry in the thread at all means nothing has been addressed to
 * anyone yet, which reads as "everyone" rather than "nobody": an empty
 * responder list would stall the room silently.
 *
 * The returned order is the roster's own seating order, never mention order —
 * rotation is what varies who leads, and it works off the roster.
 */
export function resolveGroupResponders(
  log: GroupMessage[],
  members: string[],
  thread: string,
): string[] {
  const entries = log.filter((entry) => entry.thread === thread)

  let sinceLastUser: GroupMessage[] = []

  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i]?.from.kind === 'user') {
      sinceLastUser = entries.slice(i)
      break
    }
  }

  const mentioned = new Set<string>()
  let everyone = false

  for (const entry of sinceLastUser) {
    const parsed = parseGroupMentions(entry.text, members)

    if (parsed.everyone) everyone = true
    for (const name of parsed.mentioned) mentioned.add(name)
  }

  if (everyone || mentioned.size === 0) return members

  return members.filter((member) => mentioned.has(member))
}
