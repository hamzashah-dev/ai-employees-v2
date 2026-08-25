import { describe, expect, it } from 'vitest'
import type { EmployeeThread } from '@/modules/core/types/chat'
import type { RosterEntry } from '@/modules/roster/types'
import { dayPeriod, deriveSections, summariseDay } from '.'

const NOW = new Date('2026-08-25T10:00:00').getTime()
const DAY = 86_400_000

function entry(profile: string, activityMs: number): RosterEntry {
  return {
    profile,
    displayName: profile,
    subtitle: `${profile} did a thing`,
    timeLabel: '7:34 AM',
    activityMs,
  }
}

function thread(profile: string, patch: Partial<EmployeeThread>): EmployeeThread {
  return { profile, messages: [], status: 'ready', hydrated: true, ...patch }
}

const roles = { inbox: 'Email triage' }

describe('deriveSections', () => {
  it('puts every employee on the team with its status and description', () => {
    const sections = deriveSections({
      entries: [entry('inbox', NOW), entry('sales', 0)],
      threads: { sales: thread('sales', { status: 'working' }) },
      roles,
      nowMs: NOW,
    })

    expect(sections.team).toEqual([
      { profile: 'inbox', displayName: 'inbox', role: 'Email triage', status: 'ready' },
      { profile: 'sales', displayName: 'sales', role: '', status: 'working' },
    ])
  })

  it('buckets an approval, a live turn and today’s outcomes exactly once each', () => {
    const sections = deriveSections({
      entries: [entry('inbox', NOW - 3600_000), entry('sales', NOW), entry('expense', NOW)],
      threads: {
        sales: thread('sales', {
          status: 'working',
          statusText: 'Researching 14 prospects',
          workingSince: NOW - 761_000,
        }),
        expense: thread('expense', {
          status: 'needs-you',
          approval: { id: 'a1', summary: 'Travel or Meals?', detail: '$214.00' },
        }),
      },
      roles,
      nowMs: NOW,
    })

    expect(sections.finished.map((f) => f.profile)).toEqual(['inbox'])
    expect(sections.working).toEqual([
      { profile: 'sales', displayName: 'sales', task: 'Researching 14 prospects', since: NOW - 761_000 },
    ])
    expect(sections.needsYes).toEqual([
      { profile: 'expense', displayName: 'expense', question: 'Travel or Meals?', meta: '$214.00' },
    ])
  })

  it('leaves yesterday, never-run and needs-you-without-an-approval out of finished', () => {
    const sections = deriveSections({
      entries: [entry('old', NOW - DAY), entry('never', 0), entry('stuck', NOW)],
      // 'needs-you' with no approval payload cannot be rendered as a question,
      // so it must not silently become a "finished today" row either.
      threads: { stuck: thread('stuck', { status: 'needs-you' }) },
      roles,
      nowMs: NOW,
    })

    expect(sections.finished).toEqual([])
    expect(sections.needsYes).toEqual([])
    expect(sections.team).toHaveLength(3)
  })
})

describe('summariseDay', () => {
  const sections = (finished: number, working: number, needsYes: number, team = 4) => ({
    finished: Array.from({ length: finished }, (_, i) => ({
      profile: `f${i}`,
      displayName: 'f',
      summary: '',
      timeLabel: '',
    })),
    working: Array.from({ length: working }, (_, i) => ({
      profile: `w${i}`,
      displayName: 'w',
      task: '',
    })),
    needsYes: Array.from({ length: needsYes }, (_, i) => ({
      profile: `n${i}`,
      displayName: 'n',
      question: '',
    })),
    team: Array.from({ length: team }, (_, i) => ({
      profile: `t${i}`,
      displayName: 't',
      role: '',
      status: 'ready' as const,
    })),
  })

  it('matches the canvas sentence', () => {
    expect(summariseDay(sections(2, 1, 1), 'morning')).toBe(
      '2 finished this morning, 1 working now, 1 needs a yes.',
    )
  })

  it('agrees the verb with the count', () => {
    expect(summariseDay(sections(0, 0, 1), 'afternoon')).toBe('1 needs a yes.')
    expect(summariseDay(sections(0, 0, 3), 'afternoon')).toBe('3 need a yes.')
  })

  it('says "today" outside the morning', () => {
    expect(summariseDay(sections(1, 0, 0), 'evening')).toBe('1 finished today.')
  })

  it('drops empty clauses rather than printing zeroes', () => {
    expect(summariseDay(sections(0, 2, 0), 'morning')).toBe('2 working now.')
  })

  it('has something to say when nothing happened, and when nobody is hired', () => {
    expect(summariseDay(sections(0, 0, 0), 'morning')).toBe(
      'Nothing running, and nothing finished today.',
    )
    expect(summariseDay(sections(0, 0, 0, 0), 'morning')).toBe(
      'No employees yet — hire your first from the Marketplace.',
    )
  })
})

describe('dayPeriod', () => {
  it('splits the day the way the greeting reads', () => {
    expect(dayPeriod(0)).toBe('morning')
    expect(dayPeriod(11)).toBe('morning')
    expect(dayPeriod(12)).toBe('afternoon')
    expect(dayPeriod(17)).toBe('afternoon')
    expect(dayPeriod(18)).toBe('evening')
    expect(dayPeriod(23)).toBe('evening')
  })
})
