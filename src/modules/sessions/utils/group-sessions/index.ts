import { toDate, formatRosterTime } from '@/modules/core/utils/time'
import type { HermesSessionRow } from '@/modules/core/services/hermes/types'
import type { SessionGroup, SessionSummary } from '../../types'

/**
 * `last_active` is the recency column; `started_at` is when the session opened,
 * which can be days off for one still going. Same rule `useRoster` uses for its
 * outcome lines, restated here rather than imported — `core` owns no session
 * grouping of its own, and this shape (bucketed, per-profile) is specific to
 * the sessions module.
 */
function activityMs(row: HermesSessionRow): number {
  return toDate(row.last_active ?? row.started_at ?? row.ended_at)?.getTime() ?? 0
}

function toSummary(row: HermesSessionRow): SessionSummary | null {
  const id = row.id?.trim()
  if (!id) return null

  const ms = activityMs(row)
  return {
    id,
    title: row.title?.trim() || row.preview?.trim() || 'Untitled session',
    preview: row.preview?.trim() ?? '',
    activityMs: ms,
    timeLabel: ms ? formatRosterTime(ms) : '',
    messageCount: row.message_count ?? 0,
  }
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function startOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

/**
 * §s34's two buckets — "Today" and "This month" — plus a third the canvas
 * does not draw but a real account eventually needs: anything older still has
 * to be reachable rather than silently dropped from the list.
 */
export function groupSessions(rows: HermesSessionRow[]): SessionGroup[] {
  const summaries = rows
    .map(toSummary)
    .filter((row): row is SessionSummary => row !== null)
    .sort((a, b) => b.activityMs - a.activityMs)

  const now = new Date()
  const todayStart = startOfDay(now)
  const monthStart = startOfMonth(now)

  const today: SessionSummary[] = []
  const thisMonth: SessionSummary[] = []
  const older: SessionSummary[] = []

  for (const summary of summaries) {
    if (summary.activityMs >= todayStart) today.push(summary)
    else if (summary.activityMs >= monthStart) thisMonth.push(summary)
    else older.push(summary)
  }

  return [
    { label: 'Today', sessions: today },
    { label: 'This month', sessions: thisMonth },
    { label: 'Older', sessions: older },
  ].filter((group) => group.sessions.length > 0)
}
