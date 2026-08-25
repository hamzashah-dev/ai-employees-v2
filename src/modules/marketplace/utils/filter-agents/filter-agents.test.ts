import { describe, expect, it } from 'vitest'
import { filterAgents } from '.'
import { CATALOG, type CatalogAgent } from '../../constants/catalog'

const agent = (over: Partial<CatalogAgent>): CatalogAgent => ({
  id: 'inbox-triage',
  name: 'Inbox Triage',
  tagline: 'Sorts the overnight inbox.',
  category: 'Personal',
  runs: 1,
  installs: 1,
  ...over,
})

const INBOX = agent({})
const BUGS = agent({
  id: 'bug-hunter',
  name: 'Bug Hunter',
  tagline: 'Reproduces the report.',
  category: 'Engineering',
  installs: 9,
})
/** Not on the first-party list, so it is what `Community` holds. */
const OUTSIDE = agent({
  id: 'day-planner',
  name: 'Day Planner',
  tagline: 'Turns tomorrow into a day.',
  category: 'Personal',
})

const ALL = [INBOX, BUGS, OUTSIDE]
const ANY = { query: '', category: 'All', maker: 'discover' } as const

describe('filterAgents', () => {
  it('returns everything with no query, no category and the default tab', () => {
    expect(filterAgents(ALL, ANY)).toEqual(ALL)
  })

  it('matches name and tagline case-insensitively', () => {
    expect(filterAgents(ALL, { ...ANY, query: 'BUG' })).toEqual([BUGS])
    expect(filterAgents(ALL, { ...ANY, query: 'overnight' })).toEqual([INBOX])
    expect(filterAgents(ALL, { ...ANY, query: 'nothing here' })).toEqual([])
  })

  it('ignores surrounding whitespace in the query', () => {
    expect(filterAgents(ALL, { ...ANY, query: '  bug  ' })).toEqual([BUGS])
  })

  it('gates on category', () => {
    expect(filterAgents(ALL, { ...ANY, category: 'Engineering' })).toEqual([BUGS])
    expect(filterAgents(ALL, { ...ANY, category: 'Money' })).toEqual([])
  })

  it('splits the catalog between the two maker tabs, with no agent in both', () => {
    expect(filterAgents(ALL, { ...ANY, maker: 'imagine' })).toEqual([INBOX, BUGS])
    expect(filterAgents(ALL, { ...ANY, maker: 'community' })).toEqual([OUTSIDE])
  })

  it('partitions the whole real catalog — every agent is in exactly one tab', () => {
    const first = filterAgents(CATALOG, { ...ANY, maker: 'imagine' })
    const rest = filterAgents(CATALOG, { ...ANY, maker: 'community' })

    expect(first.length + rest.length).toBe(CATALOG.length)
    expect(first.length).toBeGreaterThan(0)
    expect(rest.length).toBeGreaterThan(0)
  })

  it('applies query, category and tab together', () => {
    expect(filterAgents(ALL, { query: 'bug', category: 'Personal', maker: 'discover' })).toEqual(
      [],
    )
    expect(
      filterAgents(ALL, { query: 'inbox', category: 'Personal', maker: 'community' }),
    ).toEqual([])
  })
})
