import { GROUP_HISTORY_LIMIT } from '../../constants/groups'
import type { GroupMessage } from '../../types/groups'

export interface TrimmedGroupLog {
  log: GroupMessage[]
  watermarks: Record<string, number>
}

/**
 * Bound a room log without breaking the watermarks that index into it.
 *
 * Watermarks are positions in `log`, so dropping entries from the front moves
 * every one of them: shift by the same amount or a member re-reads entries it
 * has already answered. Clamping at 0 is the honest failure for a member whose
 * unread delta was itself trimmed away — it sees the oldest surviving entry
 * rather than a negative index.
 *
 * The retained window is deliberately larger than `GROUP_HISTORY_LIMIT`: that
 * constant is how much of the room a *member* is shown on its turn, while the
 * log also has to survive a slow member catching up on several rounds at once.
 */
export function trimGroupLog(
  log: GroupMessage[],
  watermarks: Record<string, number>,
  limit = GROUP_HISTORY_LIMIT * 4,
): TrimmedGroupLog {
  if (log.length <= limit) return { log, watermarks }

  const drop = log.length - limit
  const shifted: Record<string, number> = {}

  for (const [key, index] of Object.entries(watermarks)) {
    shifted[key] = Math.max(0, index - drop)
  }

  return { log: log.slice(drop), watermarks: shifted }
}
