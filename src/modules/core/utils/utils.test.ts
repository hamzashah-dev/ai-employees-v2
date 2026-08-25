import { describe, expect, it, beforeEach } from 'vitest'
import { getIdentity, toDisplayName, toInitials, setIdentityOverride } from './identity'
import { formatElapsed, formatRosterTime, toDate } from './time'

describe('identity', () => {
  beforeEach(() => localStorage.clear())

  it('is stable for the same profile', () => {
    expect(getIdentity('ad-creator')).toEqual(getIdentity('ad-creator'))
  })

  it('separates different profiles', () => {
    const names = ['ad-creator', 'inbox-manager', 'sales-outbound', 'talent-scout']
    const colors = new Set(names.map((n) => getIdentity(n).color))
    // Not a guarantee of zero collisions, but a hash that maps four distinct
    // names to one colour would be broken.
    expect(colors.size).toBeGreaterThan(1)
  })

  it('honours a stored override', () => {
    const before = getIdentity('ad-creator')
    setIdentityOverride('ad-creator', { colorIndex: 3, shape: 'cloud' })
    const after = getIdentity('ad-creator')

    expect(after.shape).toBe('cloud')
    expect(after.color).not.toBe(before.color)
  })

  it('derives initials from slug words', () => {
    expect(toInitials('ad-creator')).toBe('AC')
    expect(toInitials('chief')).toBe('CH')
    expect(toInitials('sales_outbound')).toBe('SO')
    expect(toInitials('')).toBe('?')
  })

  it('humanises profile slugs', () => {
    expect(toDisplayName('ad-creator')).toBe('Ad Creator')
    expect(toDisplayName('startup-kit-agent')).toBe('Startup Kit Agent')
    expect(toDisplayName('chief')).toBe('Chief')
  })
})

describe('time', () => {
  it('reads epoch seconds and milliseconds alike', () => {
    // Hermes writes seconds in some session rows and ms in others.
    const seconds = toDate(1_700_000_000)
    const millis = toDate(1_700_000_000_000)
    expect(seconds?.getTime()).toBe(millis?.getTime())
  })

  it('parses ISO strings', () => {
    expect(toDate('2026-08-25T10:00:00Z')?.getUTCFullYear()).toBe(2026)
  })

  it('returns null for junk', () => {
    expect(toDate(null)).toBeNull()
    expect(toDate('not a date')).toBeNull()
  })

  it('labels yesterday rather than a time', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatRosterTime(yesterday.toISOString())).toBe('Yesterday')
  })

  it('shows a time for today', () => {
    expect(formatRosterTime(new Date().toISOString())).toMatch(/\d/)
  })

  it('formats the working timer as hh:mm:ss', () => {
    const start = 1_000_000
    expect(formatElapsed(start, start + 761_000)).toBe('00:12:41')
    expect(formatElapsed(start, start)).toBe('00:00:00')
    expect(formatElapsed(start, start + 3_661_000)).toBe('01:01:01')
  })

  it('never shows a negative elapsed time', () => {
    expect(formatElapsed(2_000, 1_000)).toBe('00:00:00')
  })
})
