import { describe, expect, it } from 'vitest'
import { formatRelativeTime, NO_TIME } from './index'

const NOW = Date.parse('2026-08-25T12:00:00Z')
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('formatRelativeTime', () => {
  it('reads backwards for a last run and forwards for a next one', () => {
    expect(formatRelativeTime(NOW - 2 * HOUR, NOW)).toBe('2 hours ago')
    expect(formatRelativeTime(NOW + 20 * MINUTE, NOW)).toBe('in 20 minutes')
  })

  it('picks the largest unit that fits', () => {
    expect(formatRelativeTime(NOW - 45 * MINUTE, NOW)).toBe('45 minutes ago')
    expect(formatRelativeTime(NOW - 3 * DAY, NOW)).toBe('3 days ago')
    expect(formatRelativeTime(NOW - 10 * DAY, NOW)).toBe('last week')
    expect(formatRelativeTime(NOW - 400 * DAY, NOW)).toBe('last year')
  })

  it('says yesterday rather than 1 day ago', () => {
    expect(formatRelativeTime(NOW - DAY, NOW)).toBe('yesterday')
    expect(formatRelativeTime(NOW + DAY, NOW)).toBe('tomorrow')
  })

  it('does not count seconds', () => {
    expect(formatRelativeTime(NOW - 5_000, NOW)).toBe('just now')
    expect(formatRelativeTime(NOW + 5_000, NOW)).toBe('in a moment')
  })

  it('reads both wire shapes Hermes writes', () => {
    // Epoch seconds in some rows, ISO strings in others.
    expect(formatRelativeTime('2026-08-25T10:00:00Z', NOW)).toBe('2 hours ago')
    expect(formatRelativeTime((NOW - 2 * HOUR) / 1000, NOW)).toBe('2 hours ago')
  })

  it('shows a dash rather than inventing a time', () => {
    expect(formatRelativeTime(null, NOW)).toBe(NO_TIME)
    expect(formatRelativeTime(undefined, NOW)).toBe(NO_TIME)
    expect(formatRelativeTime('not a date', NOW)).toBe(NO_TIME)
  })
})
