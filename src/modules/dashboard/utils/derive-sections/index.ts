import type { EmployeeStatus, EmployeeThread } from '@/modules/core/types/chat'
import type { RosterEntry } from '@/modules/roster/types'

/**
 * Everything the dashboard shows, derived from the only two sources that exist:
 * the roster (profiles plus their last-outcome line and stamp) and the live
 * thread state the socket maintains.
 *
 * Pure and tested, because the bucketing and the counting sentence are the
 * parts that go wrong quietly — a section that silently swallows an employee,
 * or "1 need a yes".
 */

export type DayPeriod = 'morning' | 'afternoon' | 'evening'

export interface NeedsYesItem {
  profile: string
  displayName: string
  /** `approval.summary` — the question the turn stopped on. */
  question: string
  /** `approval.detail`, the card's mono meta line. Often absent. */
  meta?: string
}

export interface WorkingItem {
  profile: string
  displayName: string
  /** The agent's own `status.update` text when it sent one. */
  task: string
  /** Wall-clock ms the turn started, for the elapsed timer. */
  since?: number
}

export interface FinishedItem {
  profile: string
  displayName: string
  summary: string
  timeLabel: string
  timeIso?: string
}

export interface TeamItem {
  profile: string
  displayName: string
  /** `profile.description` — the nearest thing Hermes has to a role. */
  role: string
  status: EmployeeStatus
}

export interface DashboardSections {
  needsYes: NeedsYesItem[]
  working: WorkingItem[]
  finished: FinishedItem[]
  team: TeamItem[]
}

export interface DeriveSectionsInput {
  entries: RosterEntry[]
  threads: Record<string, EmployeeThread | undefined>
  /** profile -> description. Empty string where the profile has none. */
  roles: Record<string, string>
  nowMs: number
}

export const PERIOD_GREETING: Record<DayPeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

export function dayPeriod(hour: number): DayPeriod {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

function isSameDay(aMs: number, bMs: number): boolean {
  const a = new Date(aMs)
  const b = new Date(bMs)
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * One pass over the roster. Every employee lands in `team`, and in at most one
 * of the three activity buckets — live state wins over history, so an employee
 * who finished at 7am and is working again now is only "working now".
 */
export function deriveSections({
  entries,
  threads,
  roles,
  nowMs,
}: DeriveSectionsInput): DashboardSections {
  const needsYes: NeedsYesItem[] = []
  const working: WorkingItem[] = []
  const finished: FinishedItem[] = []
  const team: TeamItem[] = []

  for (const entry of entries) {
    const thread = threads[entry.profile]
    const status = thread?.status ?? 'ready'

    team.push({
      profile: entry.profile,
      displayName: entry.displayName,
      role: roles[entry.profile] ?? '',
      status,
    })

    if (status === 'needs-you' && thread?.approval) {
      needsYes.push({
        profile: entry.profile,
        displayName: entry.displayName,
        question: thread.approval.summary,
        meta: thread.approval.detail,
      })
      continue
    }

    if (status === 'working') {
      working.push({
        profile: entry.profile,
        displayName: entry.displayName,
        // `statusText` is free text from `status.update` and is often absent —
        // Hermes has no "current task" field to fall back on.
        task: thread?.statusText?.trim() || `${entry.displayName} is working`,
        since: thread?.workingSince,
      })
      continue
    }

    // Anything still mid-turn or waiting on the reader has already been placed,
    // and an errored or approval-less `needs-you` thread has not finished
    // anything — the team grid's pill is where those surface.
    if (status !== 'ready') continue

    // "Finished" is as near as the data gets. There is no completion event to
    // count: the roster's stamp is the last time the employee did anything and
    // its subtitle is that outcome, so "last active today" is the bucket.
    if (entry.activityMs > 0 && isSameDay(entry.activityMs, nowMs)) {
      finished.push({
        profile: entry.profile,
        displayName: entry.displayName,
        summary: entry.subtitle,
        timeLabel: entry.timeLabel,
        timeIso: entry.timeIso,
      })
    }
  }

  return { needsYes, working, finished, team }
}

/** "2 finished this morning, 1 working now, 1 needs a yes." */
export function summariseDay(sections: DashboardSections, period: DayPeriod): string {
  const parts: string[] = []

  if (sections.finished.length > 0) {
    const when = period === 'morning' ? 'this morning' : 'today'
    parts.push(`${sections.finished.length} finished ${when}`)
  }
  if (sections.working.length > 0) {
    parts.push(`${sections.working.length} working now`)
  }
  if (sections.needsYes.length > 0) {
    const verb = sections.needsYes.length === 1 ? 'needs' : 'need'
    parts.push(`${sections.needsYes.length} ${verb} a yes`)
  }

  if (parts.length > 0) return `${parts.join(', ')}.`
  if (sections.team.length === 0) {
    return 'No employees yet — hire your first from the Marketplace.'
  }
  return 'Nothing running, and nothing finished today.'
}
