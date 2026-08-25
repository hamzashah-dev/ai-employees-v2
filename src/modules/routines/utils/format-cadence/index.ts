import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { formatSchedule } from '@/modules/core/utils/format-schedule'

/**
 * The cadence column, phrased exactly as the routine's own row in the drawer
 * phrases it — same formatter, so the two surfaces cannot drift.
 *
 * `schedule_display` is Hermes's own string and is the fallback rather than the
 * source: for a cron job it is literally the expression that was posted
 * (`cron/jobs.py:1251` stores `parsed_schedule["display"]`, which for the cron
 * branch is the raw text), so it reads as "0 18 * * 1-5" where the design wants
 * "Weekdays at 6:00 PM".
 */
export function formatCadence(job: HermesCronJob): string {
  const formatted = formatSchedule(job.schedule)
  if (formatted !== 'Schedule unknown') return formatted

  const display = job.schedule_display?.trim()
  return display && display !== '?' ? formatSchedule(display) : 'Schedule unknown'
}
