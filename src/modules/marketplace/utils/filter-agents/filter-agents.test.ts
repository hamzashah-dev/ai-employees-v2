import { describe, expect, it } from 'vitest'
import { byInstalls, filterAgents } from '.'
import type { CatalogAgent } from '../../constants/catalog'

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

const ALL = [INBOX, BUGS]

describe('filterAgents', () => {
  it('returns everything with no query and no category', () => {
    expect(filterAgents(ALL, { query: '', category: 'All' })).toEqual(ALL)
  })

  it('matches name and tagline case-insensitively', () => {
    expect(filterAgents(ALL, { query: 'BUG', category: 'All' })).toEqual([BUGS])
    expect(filterAgents(ALL, { query: 'overnight', category: 'All' })).toEqual([INBOX])
    expect(filterAgents(ALL, { query: 'nothing here', category: 'All' })).toEqual([])
  })

  it('ignores surrounding whitespace in the query', () => {
    expect(filterAgents(ALL, { query: '  bug  ', category: 'All' })).toEqual([BUGS])
  })

  it('gates on category', () => {
    expect(filterAgents(ALL, { query: '', category: 'Engineering' })).toEqual([BUGS])
    expect(filterAgents(ALL, { query: '', category: 'Money' })).toEqual([])
  })

  it('applies query and category together', () => {
    expect(filterAgents(ALL, { query: 'bug', category: 'Personal' })).toEqual([])
  })
})

describe('byInstalls', () => {
  it('orders most-installed first without mutating its input', () => {
    const input = [INBOX, BUGS]
    expect(byInstalls(input)).toEqual([BUGS, INBOX])
    expect(input).toEqual([INBOX, BUGS])
  })
})
