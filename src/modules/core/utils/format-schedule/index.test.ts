import { describe, expect, it } from 'vitest'
import { formatSchedule } from './index'

/**
 * One representative case per branch of the formatter, plus the fallback.
 *
 * The point is not coverage of every cron shape — it is that the branch which
 * *declines* to phrase something (a day-of-month rule, a one-shot timestamp)
 * still returns the raw expression rather than a half-right English sentence.
 */
describe('formatSchedule', () => {
  it('phrases intervals', () => {
    expect(formatSchedule('every 15m')).toBe('Every 15 minutes')
    expect(formatSchedule('every 2h')).toBe('Every 2 hours')
    expect(formatSchedule('every 1d')).toBe('Every day')
  })

  it('phrases 5-field cron, including steps', () => {
    expect(formatSchedule('0 8 * * *')).toBe('Every day at 8:00 AM')
    expect(formatSchedule('30 18 * * *')).toBe('Every day at 6:30 PM')
    expect(formatSchedule('*/15 * * * *')).toBe('Every 15 minutes')
    expect(formatSchedule('0 * * * *')).toBe('Every hour')
  })

  it('phrases weekday ranges, lists and aliases', () => {
    expect(formatSchedule('0 18 * * 1-5')).toBe('Weekdays at 6:00 PM')
    expect(formatSchedule('0 8 * * 0,6')).toBe('Weekends at 8:00 AM')
    expect(formatSchedule('0 8 * * fri')).toBe('Fridays at 8:00 AM')
    expect(formatSchedule('*/30 * * * 1-5')).toBe('Every 30 minutes on weekdays')
  })

  it('reads the object-shaped schedule Hermes stores', () => {
    expect(formatSchedule({ kind: 'interval', minutes: 90 })).toBe('Every 90 minutes')
    expect(formatSchedule({ kind: 'cron', expr: '0 9 * * 1' })).toBe(
      'Mondays at 9:00 AM',
    )
    expect(formatSchedule({ kind: 'once', run_at: 'once at 2026-02-03 14:00' })).toBe(
      'Once at 2026-02-03 14:00',
    )
  })

  it('falls back to the raw text rather than guessing', () => {
    // A day-of-month rule has no phrasing in the design.
    expect(formatSchedule('0 8 1 * *')).toBe('0 8 1 * *')
    expect(formatSchedule('nonsense')).toBe('Nonsense')
    expect(formatSchedule('?')).toBe('Schedule unknown')
    expect(formatSchedule(undefined)).toBe('Schedule unknown')
  })
})
