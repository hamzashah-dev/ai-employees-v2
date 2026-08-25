import { describe, expect, it } from 'vitest'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { lastActivityByProfile, matchEmployees } from '.'

function profile(name: string): HermesProfile {
  return {
    name,
    path: `/tmp/${name}`,
    is_default: false,
    model: null,
    provider: null,
    has_env: true,
    skill_count: 0,
    gateway_running: false,
    description: '',
  }
}

const ROSTER = [
  profile('expense-manager'),
  profile('inbox-triage'),
  profile('sales-outbound'),
  profile('managed-reports'),
]

const names = (query: string): string[] =>
  matchEmployees(ROSTER, query).map((match) => match.displayName)

describe('matchEmployees', () => {
  it('returns nothing for an empty query rather than the whole roster', () => {
    expect(matchEmployees(ROSTER, '')).toEqual([])
    expect(matchEmployees(ROSTER, '   ')).toEqual([])
  })

  it('matches the display name, not only the slug', () => {
    expect(names('Expense Man')).toEqual(['Expense Manager'])
  })

  it('matches the slug, which reads differently from the name', () => {
    expect(names('sales-out')).toEqual(['Sales Outbound'])
  })

  it('is case-insensitive and ignores surrounding whitespace', () => {
    expect(names('  INBOX  ')).toEqual(['Inbox Triage'])
  })

  it('ranks a leading match above a mid-word one', () => {
    expect(names('man')).toEqual(['Managed Reports', 'Expense Manager'])
  })

  it('breaks a rank tie alphabetically', () => {
    expect(names('a')).toEqual(['Expense Manager', 'Inbox Triage', 'Managed Reports', 'Sales Outbound'])
  })

  it('returns nothing when no employee matches', () => {
    expect(names('kubernetes')).toEqual([])
  })

  it('carries the activity stamp through, defaulting to zero', () => {
    const activity = new Map([['inbox-triage', 1_700_000_000_000]])
    const matches = matchEmployees(ROSTER, 'triage', activity)
    expect(matches[0]?.activityMs).toBe(1_700_000_000_000)
    expect(matchEmployees(ROSTER, 'expense')[0]?.activityMs).toBe(0)
  })
})

describe('lastActivityByProfile', () => {
  const empty = { recents: [], cron: [], messaging: [] }

  it('takes the newest stamp across all three lists', () => {
    const map = lastActivityByProfile({
      ...empty,
      recents: [{ profile: 'inbox-triage', last_active: 1_700_000_000 }],
      // A routine that finished later is the newest thing that employee did.
      cron: [{ profile: 'inbox-triage', last_active: 1_700_000_900 }],
    })
    expect(map.get('inbox-triage')).toBe(1_700_000_900_000)
  })

  it('prefers last_active over the fallbacks', () => {
    const map = lastActivityByProfile({
      ...empty,
      recents: [
        {
          profile: 'inbox-triage',
          last_active: 1_700_000_900,
          ended_at: 1_700_000_500,
          started_at: 1_600_000_000,
        },
      ],
    })
    expect(map.get('inbox-triage')).toBe(1_700_000_900_000)
  })

  it('falls back to ended_at, then started_at', () => {
    const map = lastActivityByProfile({
      ...empty,
      recents: [{ profile: 'a', ended_at: 1_700_000_500, started_at: 1_600_000_000 }],
      cron: [{ profile: 'b', started_at: 1_600_000_000 }],
    })
    expect(map.get('a')).toBe(1_700_000_500_000)
    expect(map.get('b')).toBe(1_600_000_000_000)
  })

  it('ignores rows with no owning profile', () => {
    const map = lastActivityByProfile({
      ...empty,
      messaging: [{ profile: '  ', last_active: 1_700_000_000 }, { last_active: 1 }],
    })
    expect(map.size).toBe(0)
  })
})
