import type { GroupMessage } from '@/modules/core/types/groups'

/**
 * One room-log entry rendered as the transcript line a single member reads.
 *
 * Members never receive the log as data — a turn prompt hands them plain text —
 * so this line is the only place a speaker's identity survives. The ` (you)`
 * suffix is what stops a member from answering itself: in a shared transcript
 * every line reads as somebody else's until one of them is marked.
 *
 * The desktop plugin also appends a `[device]` suffix for members living on
 * another machine. Ours are always local profiles, so there is nothing to
 * disambiguate and the suffix is deliberately absent.
 */
export function formatGroupLine(entry: GroupMessage, viewer: string): string {
  if (entry.from.kind === 'user') {
    return `${entry.from.name} (user): ${entry.text}`
  }

  const suffix = entry.from.name === viewer ? ' (you)' : ''

  return `${entry.from.name}${suffix}: ${entry.text}`
}
