import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HermesSessionRow } from '@/modules/core/services/hermes/types'
import { groupSessions } from './index'

function row(overrides: Partial<HermesSessionRow>): HermesSessionRow {
  return { id: 'a', title: 'Untitled', message_count: 1, ...overrides }
}

describe('groupSessions', () => {
  // Frozen mid-month so "10 days ago" cannot cross into the previous month
  // regardless of which day this suite happens to run on.
  beforeEach(() => vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0)))
  afterEach(() => vi.useRealTimers())

  it('buckets by recency into Today, This month and Older', () => {
    const now = Date.now()
    const today = row({ id: 'today', last_active: now / 1000 })
    const earlierThisMonth = row({
      id: 'this-month',
      last_active: (now - 10 * 86_400_000) / 1000,
    })
    const older = row({ id: 'older', last_active: (now - 400 * 86_400_000) / 1000 })

    const groups = groupSessions([today, earlierThisMonth, older])

    expect(groups.map((g) => g.label)).toEqual(['Today', 'This month', 'Older'])
    expect(groups[0]?.sessions[0]?.id).toBe('today')
    expect(groups[1]?.sessions[0]?.id).toBe('this-month')
    expect(groups[2]?.sessions[0]?.id).toBe('older')
  })

  it('omits an empty bucket rather than rendering an empty heading', () => {
    const groups = groupSessions([row({ id: 'x', last_active: Date.now() / 1000 })])
    expect(groups.map((g) => g.label)).toEqual(['Today'])
  })

  it('drops a row with no id, since there is nothing to open it with', () => {
    const groups = groupSessions([row({ id: undefined })])
    expect(groups).toEqual([])
  })

  it('falls back to the preview, then a plain label, when a session has no title', () => {
    const groups = groupSessions([
      row({ id: 'a', title: undefined, preview: 'Pulled the Q3 numbers', last_active: Date.now() / 1000 }),
      row({ id: 'b', title: undefined, preview: undefined, last_active: Date.now() / 1000 }),
    ])
    const titles = groups[0]?.sessions.map((s) => s.title)
    expect(titles).toContain('Pulled the Q3 numbers')
    expect(titles).toContain('Untitled session')
  })

  it('sorts newest first within a bucket', () => {
    const now = Date.now()
    const groups = groupSessions([
      row({ id: 'older', last_active: (now - 1000) / 1000 }),
      row({ id: 'newer', last_active: now / 1000 }),
    ])
    expect(groups[0]?.sessions.map((s) => s.id)).toEqual(['newer', 'older'])
  })
})
