import type { HermesProfile, HermesSessionRow } from '@/modules/core/services/hermes/types'
import { toDisplayName } from '@/modules/core/utils/identity'
import { toDate } from '@/modules/core/utils/time'

/**
 * The `Employees` group of D10 — a name match over the roster.
 *
 * No backend at all. `GET /api/profiles` is already in the React Query cache (the
 * sidebar holds it under the same key), so this group answers on the keystroke
 * while the `Messages` group is still debouncing.
 */

export interface EmployeeMatch {
  profile: string
  displayName: string
  /** Epoch ms of the employee's most recent activity, or 0 when it has none. */
  activityMs: number
}

/**
 * Matches the slug and the display name both, because they read differently:
 * `GET /api/profiles` returns `expense-manager`, the row shows `Expense Manager`,
 * and someone typing "expense m" means the second.
 *
 * Ranked by where the match falls — a name that *starts* with the query is what
 * the user is reaching for; a mid-word hit is a coincidence. Recency deliberately
 * does not enter the ordering: a roster is short and alphabetical is predictable,
 * whereas "the one I used last" moves the row out from under the cursor.
 */
export function matchEmployees(
  profiles: HermesProfile[],
  query: string,
  activity: Map<string, number> = new Map(),
): EmployeeMatch[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  return profiles
    .map((profile) => ({
      profile: profile.name,
      displayName: toDisplayName(profile.name),
      activityMs: activity.get(profile.name) ?? 0,
    }))
    .filter((match) => rank(match, needle) < NO_MATCH)
    .sort(
      (a, b) =>
        rank(a, needle) - rank(b, needle) || a.displayName.localeCompare(b.displayName),
    )
}

const STARTS_WITH = 0
const CONTAINS = 1
const NO_MATCH = 2

function rank(match: EmployeeMatch, needle: string): number {
  const name = match.displayName.toLowerCase()
  const slug = match.profile.toLowerCase()

  if (name.startsWith(needle) || slug.startsWith(needle)) return STARTS_WITH
  if (name.includes(needle) || slug.includes(needle)) return CONTAINS
  return NO_MATCH
}

/**
 * Last-activity stamp per employee, for the row's right-aligned timestamp.
 *
 * Duplicates the reduce in `modules/roster/hooks/use-roster` — deliberately, and
 * not happily: a feature module may not import another's internals, and this one
 * needs the same three lists collapsed the same way. The clean fix is to promote
 * the roster's entry-building into `modules/core`; until then the two must be
 * kept in step. `last_active` is the recency column, `started_at` only says when
 * the thread opened.
 */
export function lastActivityByProfile(sessions: {
  recents: HermesSessionRow[]
  cron: HermesSessionRow[]
  messaging: HermesSessionRow[]
}): Map<string, number> {
  const latest = new Map<string, number>()

  for (const row of [...sessions.recents, ...sessions.cron, ...sessions.messaging]) {
    const profile = row.profile?.trim()
    if (!profile) continue
    const ms = toDate(row.last_active ?? row.ended_at ?? row.started_at)?.getTime() ?? 0
    if (ms > (latest.get(profile) ?? 0)) latest.set(profile, ms)
  }

  return latest
}
