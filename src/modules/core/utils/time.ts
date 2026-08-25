/**
 * Timestamp formatting, matching the canvas exactly.
 *
 * Roster rows show "7:34", "Yesterday" or "Tuesday" depending on age; thread
 * separators show "8:01 AM"; the working timer is mono "00:12:41".
 */

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' })

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function toDate(value: string | number | null | undefined): Date | null {
  if (value == null) return null
  // Hermes writes epoch seconds in some rows and ISO strings in others.
  if (typeof value === 'number') {
    return new Date(value < 1e12 ? value * 1000 : value)
  }
  const numeric = Number(value)
  if (!Number.isNaN(numeric) && value.trim() !== '') {
    return new Date(numeric < 1e12 ? numeric * 1000 : numeric)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Roster-row stamp: time today, "Yesterday", weekday this week, else a date. */
export function formatRosterTime(value: string | number | null | undefined): string {
  const date = toDate(value)
  if (!date) return ''

  const now = new Date()
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)

  if (days <= 0) return timeFormatter.format(date)
  if (days === 1) return 'Yesterday'
  if (days < 7) return weekdayFormatter.format(date)
  return dateFormatter.format(date)
}

/** Thread separator: "8:01 AM". */
export function formatThreadTime(value: number | Date): string {
  return timeFormatter.format(value instanceof Date ? value : new Date(value))
}

/** Elapsed working timer: "00:12:41". */
export function formatElapsed(sinceMs: number, nowMs: number = Date.now()): string {
  const total = Math.max(0, Math.floor((nowMs - sinceMs) / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
}
