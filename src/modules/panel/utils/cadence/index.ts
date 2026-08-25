import { scheduleText } from '@/modules/core/utils/format-schedule'

/**
 * The editor's cadence control, and the cron expressions it stands for.
 *
 * `cron/jobs.py:parse_schedule` accepts four shapes; the editor only ever posts a
 * 5-field cron expression, because that is the only one of the four that both
 * recurs and lands on a wall-clock time. (`every 30m` recurs but drifts off the
 * hour, a bare duration and an ISO timestamp are one-shots.)
 *
 * The pairing that matters is with `formatSchedule`: what you type here is what
 * the routine row reads back. `Weekdays` at `18:00` has to render as exactly
 * "Weekdays at 6:00 PM", and the round-trip test over the whole
 * Daily/Weekdays/Weekly x 24h x :00/:30 space is what holds the two in step.
 */

export type CadenceKind = 'daily' | 'weekdays' | 'weekly' | 'custom'

export interface Cadence {
  kind: CadenceKind
  /** 24-hour `HH:MM` — the value an `<input type="time">` carries. */
  time: string
  /** 0 = Sunday, cron's own numbering. Only read when `kind` is `weekly`. */
  weekday: number
  /** A raw 5-field expression. Only read when `kind` is `custom`. */
  expression: string
}

/** Cron's weekday numbering, for the Weekly picker. */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
] as const

export const CADENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
] as const satisfies readonly { value: CadenceKind; label: string }[]

/** 9am on a weekday morning — a real starting value, not a placeholder. */
export const DEFAULT_CADENCE: Cadence = {
  kind: 'daily',
  time: '09:00',
  weekday: 1,
  expression: '0 9 * * *',
}

const TIME_RE = /^(\d{1,2}):(\d{2})$/

/**
 * The expression a cadence stands for, or `null` when it does not stand for one
 * yet — an unset time field, or a Custom tab with nothing typed in it. The
 * editor treats `null` as "cannot save", so validity is decided here rather than
 * duplicated in the form.
 */
export function toCronExpression(cadence: Cadence): string | null {
  if (cadence.kind === 'custom') {
    const expression = cadence.expression.trim().replace(/\s+/g, ' ')
    return expression.split(' ').length === 5 ? expression : null
  }

  const time = parseTime(cadence.time)
  if (!time) return null

  const dayOfWeek =
    cadence.kind === 'daily'
      ? '*'
      : cadence.kind === 'weekdays'
        ? '1-5'
        : String(normalizeWeekday(cadence.weekday))

  return `${time.minute} ${time.hour} * * ${dayOfWeek}`
}

/**
 * The cadence behind a stored schedule, so editing an existing routine opens on
 * the control that made it rather than dropping the user into Custom.
 *
 * Anything the four tabs cannot express — an interval, a one-shot, a
 * day-of-month rule, a step — comes back as `custom` carrying the raw text,
 * which is the only honest thing to show for a schedule the tabs would silently
 * rewrite.
 */
export function fromCronExpression(schedule: unknown): Cadence {
  const raw = scheduleText(schedule)
  const custom: Cadence = { ...DEFAULT_CADENCE, kind: 'custom', expression: raw }
  if (!raw) return { ...custom, expression: '' }

  const fields = raw.split(/\s+/)
  if (fields.length !== 5) return custom
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields
  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) return custom
  if (month !== '*' || dayOfMonth !== '*') return custom

  const minuteValue = parseField(minute, 0, 59)
  const hourValue = parseField(hour, 0, 23)
  if (minuteValue == null || hourValue == null) return custom

  const time = `${pad(hourValue)}:${pad(minuteValue)}`

  if (dayOfWeek === '*') return { ...custom, kind: 'daily', time }
  if (dayOfWeek === '1-5') return { ...custom, kind: 'weekdays', time }

  const day = parseField(dayOfWeek, 0, 7)
  if (day == null) return custom
  return { ...custom, kind: 'weekly', time, weekday: normalizeWeekday(day) }
}

/** Cron takes both 0 and 7 for Sunday; the picker only offers 0. */
function normalizeWeekday(day: number): number {
  return day === 7 ? 0 : day
}

function parseTime(value: string): { hour: number; minute: number } | null {
  const match = TIME_RE.exec(value.trim())
  if (!match) return null
  const [, rawHour, rawMinute] = match
  if (!rawHour || !rawMinute) return null
  const hour = Number(rawHour)
  const minute = Number(rawMinute)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

/** A single plain integer, in range. Ranges, lists and steps are not this. */
function parseField(field: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(field)) return null
  const value = Number(field)
  return value >= min && value <= max ? value : null
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
