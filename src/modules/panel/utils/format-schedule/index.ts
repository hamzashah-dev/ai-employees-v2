import type { CronScheduleObject } from '../../types'

/**
 * Turns a Hermes schedule into the canvas's phrasing — "Every day at 8:00 AM",
 * "Weekdays at 6:00 PM", "Fridays at 8:00 AM", "Every 15 minutes".
 *
 * Only the shapes listed below are recognised; anything else (a day-of-month
 * rule, a specific month, a one-shot timestamp) falls through to the raw text,
 * because a half-right English sentence about when an employee acts on its own
 * is worse than an honest cron expression.
 */

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const WEEKDAY_ALIASES: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

const MINUTES_PER_UNIT: Record<string, number> = {
  m: 1,
  min: 1,
  mins: 1,
  minute: 1,
  minutes: 1,
  h: 60,
  hr: 60,
  hrs: 60,
  hour: 60,
  hours: 60,
  d: 1440,
  day: 1440,
  days: 1440,
}

const INTERVAL_RE = /^every\s+(\d+)\s*([a-z]+)$/i
const STEP_RE = /^\*\/(\d+)$/

export function formatSchedule(schedule: unknown): string {
  const raw = toScheduleText(schedule)
  if (!raw) return 'Schedule unknown'
  // The fallback is sentence-cased so Hermes's own phrasings ("once at
  // 2026-02-03 14:00") sit beside the formatted ones; a cron expression starts
  // with a digit or a star, so this leaves it untouched.
  return formatInterval(raw) ?? formatCronExpression(raw) ?? sentenceCase(raw)
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Pulls the most human field out of whichever schedule shape Hermes stored. */
function toScheduleText(schedule: unknown): string {
  if (typeof schedule === 'string') {
    const text = schedule.trim()
    // `_schedule_display_for_job` writes "?" when a job record has no schedule.
    return text === '?' ? '' : text
  }
  if (schedule && typeof schedule === 'object') {
    const record = schedule as CronScheduleObject
    if (record.kind === 'interval' && typeof record.minutes === 'number') {
      return `every ${record.minutes}m`
    }
    for (const key of ['expr', 'display', 'value', 'run_at'] as const) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return ''
}

/** "every 30m" / "every 2h" — the recurring form of `parse_schedule`. */
function formatInterval(raw: string): string | null {
  const match = INTERVAL_RE.exec(raw)
  if (!match) return null
  const [, amount, unit] = match
  if (!amount || !unit) return null
  const perUnit = MINUTES_PER_UNIT[unit.toLowerCase()]
  if (perUnit == null) return null
  const minutes = Number(amount) * perUnit
  return minutes > 0 ? formatEveryMinutes(minutes) : null
}

function formatEveryMinutes(minutes: number): string {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440
    return days === 1 ? 'Every day' : `Every ${days} days`
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? 'Every hour' : `Every ${hours} hours`
  }
  return minutes === 1 ? 'Every minute' : `Every ${minutes} minutes`
}

interface TimePhrase {
  /** A sub-daily cadence ("Every hour") reads differently from a clock time. */
  recurring: boolean
  text: string
}

interface DayPhrase {
  /** Leads the sentence: "Weekdays at 6:00 PM". */
  label: string
  /** Trails a cadence: "Every 15 minutes on weekdays". Empty when unrestricted. */
  suffix: string
}

function formatCronExpression(raw: string): string | null {
  const fields = raw.split(/\s+/)
  if (fields.length !== 5) return null
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields
  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) return null

  // Month and day-of-month rules have no phrasing in the canvas.
  if (month !== '*' || (dayOfMonth !== '*' && dayOfMonth !== '?')) return null

  const days = describeDays(dayOfWeek)
  if (!days) return null
  const time = describeTime(minute, hour)
  if (!time) return null

  if (time.recurring) return days.suffix ? `${time.text} ${days.suffix}` : time.text
  return `${days.label} at ${time.text}`
}

function describeTime(minute: string, hour: string): TimePhrase | null {
  if (minute === '*') {
    return hour === '*' ? { recurring: true, text: 'Every minute' } : null
  }

  const minuteStep = parseStep(minute)
  if (minuteStep != null) {
    // "*/15 9 * * *" is every 15 minutes within one hour — not a cadence we phrase.
    if (hour !== '*') return null
    return { recurring: true, text: formatEveryMinutes(minuteStep) }
  }

  const minuteValue = parseSingleValue(minute, 0, 59)
  if (minuteValue == null) return null

  if (hour === '*') {
    return {
      recurring: true,
      text: minuteValue === 0 ? 'Every hour' : `Every hour at :${pad(minuteValue)}`,
    }
  }

  const hourStep = parseStep(hour)
  if (hourStep != null) {
    const base = hourStep === 1 ? 'Every hour' : `Every ${hourStep} hours`
    return {
      recurring: true,
      text: minuteValue === 0 ? base : `${base} at :${pad(minuteValue)}`,
    }
  }

  const hours = parseValues(hour, 0, 23)
  if (!hours || hours.length === 0) return null
  return {
    recurring: false,
    text: joinList(hours.map((value) => formatClock(value, minuteValue))),
  }
}

function describeDays(field: string): DayPhrase | null {
  if (field === '*' || field === '?') return { label: 'Every day', suffix: '' }

  const values = parseValues(field, 0, 7, WEEKDAY_ALIASES)
  if (!values || values.length === 0) return null
  // Cron accepts both 0 and 7 for Sunday.
  const days = [...new Set(values.map((value) => (value === 7 ? 0 : value)))].sort(
    (a, b) => a - b,
  )

  if (days.length === 7) return { label: 'Every day', suffix: '' }
  if (isSameSet(days, [1, 2, 3, 4, 5])) {
    return { label: 'Weekdays', suffix: 'on weekdays' }
  }
  if (isSameSet(days, [0, 6])) return { label: 'Weekends', suffix: 'on weekends' }

  const names: string[] = []
  for (const day of days) {
    const name = WEEKDAY_NAMES[day]
    if (!name) return null
    names.push(`${name}s`)
  }
  const joined = joinList(names)
  return { label: joined, suffix: `on ${joined}` }
}

function parseStep(field: string): number | null {
  const match = STEP_RE.exec(field)
  if (!match) return null
  const [, step] = match
  if (!step) return null
  const value = Number(step)
  return Number.isInteger(value) && value > 0 ? value : null
}

/** Expands "9", "1-5" and "1,3,5" (plus weekday aliases) into sorted values. */
function parseValues(
  field: string,
  min: number,
  max: number,
  aliases?: Record<string, number>,
): number[] | null {
  const values: number[] = []

  for (const part of field.split(',')) {
    const token = part.trim().toLowerCase()
    if (!token) return null

    const range = token.split('-')
    const [start, end, ...extra] = range
    if (extra.length > 0 || !start) return null

    const from = parseAtom(start, min, max, aliases)
    if (from == null) return null
    if (end === undefined) {
      values.push(from)
      continue
    }
    const to = parseAtom(end, min, max, aliases)
    if (to == null || to < from) return null
    for (let value = from; value <= to; value++) values.push(value)
  }

  return values.length > 0 ? [...new Set(values)].sort((a, b) => a - b) : null
}

function parseAtom(
  token: string,
  min: number,
  max: number,
  aliases?: Record<string, number>,
): number | null {
  const alias = aliases?.[token]
  if (alias != null) return alias
  if (!/^\d+$/.test(token)) return null
  const value = Number(token)
  return value >= min && value <= max ? value : null
}

function parseSingleValue(field: string, min: number, max: number): number | null {
  const values = parseValues(field, min, max)
  if (!values) return null
  const [only, ...rest] = values
  return only !== undefined && rest.length === 0 ? only : null
}

function formatClock(hour: number, minute: number): string {
  const meridiem = hour < 12 ? 'AM' : 'PM'
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  return `${twelve}:${pad(minute)} ${meridiem}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  const last = items[items.length - 1] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${last}`
}

function isSameSet(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}
