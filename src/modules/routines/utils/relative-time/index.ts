import { toDate } from '@/modules/core/utils/time'

/**
 * "2 hours ago", "in 20 minutes", "yesterday".
 *
 * `Intl.RelativeTimeFormat` does the wording, the plurals and the locale; the
 * only real logic here is picking the unit, and `numeric: 'auto'` is what turns
 * "1 day ago" into "yesterday". `core/utils/time.ts` already owns the parsing —
 * Hermes writes epoch seconds in some rows and ISO strings in others — so this
 * borrows `toDate` rather than repeating that guess.
 *
 * Seconds are deliberately not a unit: a routine's last run is not interesting
 * to the second, and "in 3 seconds" on a table that does not tick reads as a
 * live countdown that has frozen.
 */

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

/** Largest first; the first threshold the gap clears wins. */
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/** What a row shows when a routine has never run, or has no next run scheduled. */
export const NO_TIME = '—'

export function formatRelativeTime(
  value: string | number | null | undefined,
  now: number = Date.now(),
): string {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) return NO_TIME

  const delta = date.getTime() - now

  for (const [unit, span] of UNITS) {
    if (Math.abs(delta) >= span) {
      return relative.format(Math.round(delta / span), unit)
    }
  }

  // Under a minute either way. "in 0 minutes" is not a thing anyone says.
  return delta >= 0 ? 'in a moment' : 'just now'
}
