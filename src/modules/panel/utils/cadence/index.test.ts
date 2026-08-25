import { describe, expect, it } from 'vitest'
import { formatSchedule } from '@/modules/core/utils/format-schedule'
import {
  DEFAULT_CADENCE,
  fromCronExpression,
  toCronExpression,
  type Cadence,
} from './index'

/**
 * The test that earns its place is the round-trip: a cadence the editor builds
 * has to read back through `formatSchedule` as the sentence the user chose.
 *
 * The expectation is computed independently below rather than by calling the
 * code under test, so an off-by-one in the 12-hour conversion or the weekday
 * numbering fails here instead of agreeing with itself.
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

function clock(hour: number, minute: number): string {
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  return `${twelve}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
}

function expectedSentence(cadence: Cadence, hour: number, minute: number): string {
  if (cadence.kind === 'daily') return `Every day at ${clock(hour, minute)}`
  if (cadence.kind === 'weekdays') return `Weekdays at ${clock(hour, minute)}`
  return `${WEEKDAY_NAMES[cadence.weekday]}s at ${clock(hour, minute)}`
}

function cadences(): { cadence: Cadence; hour: number; minute: number }[] {
  const out: { cadence: Cadence; hour: number; minute: number }[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      out.push({ cadence: { ...DEFAULT_CADENCE, kind: 'daily', time }, hour, minute })
      out.push({ cadence: { ...DEFAULT_CADENCE, kind: 'weekdays', time }, hour, minute })
      for (let weekday = 0; weekday < 7; weekday++) {
        out.push({
          cadence: { ...DEFAULT_CADENCE, kind: 'weekly', time, weekday },
          hour,
          minute,
        })
      }
    }
  }
  return out
}

describe('toCronExpression', () => {
  it('maps the cadences the design names', () => {
    expect(toCronExpression({ ...DEFAULT_CADENCE, kind: 'daily', time: '08:00' })).toBe(
      '0 8 * * *',
    )
    expect(
      toCronExpression({ ...DEFAULT_CADENCE, kind: 'weekdays', time: '18:00' }),
    ).toBe('0 18 * * 1-5')
    expect(
      toCronExpression({ ...DEFAULT_CADENCE, kind: 'weekly', time: '08:00', weekday: 5 }),
    ).toBe('0 8 * * 5')
    expect(
      toCronExpression({ ...DEFAULT_CADENCE, kind: 'custom', expression: '*/15 * * * *' }),
    ).toBe('*/15 * * * *')
  })

  it('refuses to build an expression it cannot build', () => {
    expect(toCronExpression({ ...DEFAULT_CADENCE, time: '' })).toBeNull()
    expect(toCronExpression({ ...DEFAULT_CADENCE, time: '25:00' })).toBeNull()
    expect(
      toCronExpression({ ...DEFAULT_CADENCE, kind: 'custom', expression: '  ' }),
    ).toBeNull()
    // Four fields is not a cron expression, and Hermes would reject it.
    expect(
      toCronExpression({ ...DEFAULT_CADENCE, kind: 'custom', expression: '0 8 * *' }),
    ).toBeNull()
  })
})

describe('the editor round-trips against the routine row', () => {
  it('formats every Daily / Weekdays / Weekly cadence back to the sentence it was built from', () => {
    for (const { cadence, hour, minute } of cadences()) {
      const expression = toCronExpression(cadence)
      expect(expression).not.toBeNull()
      expect(formatSchedule(expression)).toBe(expectedSentence(cadence, hour, minute))
    }
  })

  it('reopens every cadence on the control that made it', () => {
    for (const { cadence } of cadences()) {
      const expression = toCronExpression(cadence) ?? ''
      // `expression` is only read on the Custom tab, and reopening always fills
      // it with what was actually stored — so it is the one field that is
      // expected to come back different from the cadence that built it.
      expect(fromCronExpression(expression)).toEqual({ ...cadence, expression })
    }
  })
})

describe('fromCronExpression', () => {
  it('reads the object shape Hermes stores', () => {
    expect(fromCronExpression({ kind: 'cron', expr: '0 18 * * 1-5' })).toMatchObject({
      kind: 'weekdays',
      time: '18:00',
    })
  })

  it('treats Sunday as 0 however cron spelled it', () => {
    expect(fromCronExpression('0 9 * * 7')).toMatchObject({ kind: 'weekly', weekday: 0 })
    expect(fromCronExpression('0 9 * * 0')).toMatchObject({ kind: 'weekly', weekday: 0 })
  })

  it('falls back to Custom rather than rewriting a schedule the tabs cannot express', () => {
    // An interval, a day-of-month rule and a step all survive as raw text.
    expect(fromCronExpression('every 30m')).toMatchObject({
      kind: 'custom',
      expression: 'every 30m',
    })
    expect(fromCronExpression('0 8 1 * *')).toMatchObject({ kind: 'custom' })
    expect(fromCronExpression('*/15 * * * *')).toMatchObject({ kind: 'custom' })
    expect(fromCronExpression(undefined)).toMatchObject({ kind: 'custom', expression: '' })
  })
})
