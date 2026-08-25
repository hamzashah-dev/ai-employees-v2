import { describe, expect, it } from 'vitest'
import { sortAgents } from '.'
import { CONNECTORS } from '../../constants/connectors'
import type { CatalogAgent } from '../../constants/catalog'

const agent = (over: Partial<CatalogAgent> & { id: string }): CatalogAgent => ({
  name: over.id,
  tagline: 'A tagline.',
  category: 'Personal',
  runs: 0,
  installs: 0,
  ...over,
})

const names = (agents: readonly CatalogAgent[]): string[] => agents.map((a) => a.id)

const ZEBRA = agent({ id: 'zebra', name: 'Zebra', installs: 900, addedAt: '2025-01-01' })
const APPLE = agent({
  id: 'apple',
  name: 'Apple',
  installs: 100,
  addedAt: '2026-03-01',
  connectors: [CONNECTORS.slack, CONNECTORS.gmail],
})
const MANGO = agent({
  id: 'mango',
  name: 'Mango',
  installs: 500,
  addedAt: '2025-09-30',
  connectors: [CONNECTORS.notion],
})

const ALL = [ZEBRA, APPLE, MANGO]

describe('sortAgents', () => {
  it('does not mutate its input', () => {
    const input = [...ALL]
    sortAgents(input, 'a-z')
    expect(names(input)).toEqual(['zebra', 'apple', 'mango'])
  })

  it('puts the most-installed first for Recommended', () => {
    expect(names(sortAgents(ALL, 'recommended'))).toEqual(['zebra', 'mango', 'apple'])
  })

  it('orders by name for A–Z', () => {
    expect(names(sortAgents(ALL, 'a-z'))).toEqual(['apple', 'mango', 'zebra'])
  })

  it('counts connectors, and keeps an agent with none behind one that has some', () => {
    expect(names(sortAgents(ALL, 'most-connectors'))).toEqual(['apple', 'mango', 'zebra'])
  })

  it('breaks a connector tie on installs rather than on catalog order', () => {
    const a = agent({ id: 'a', installs: 1, connectors: [CONNECTORS.slack] })
    const b = agent({ id: 'b', installs: 2, connectors: [CONNECTORS.gmail] })
    expect(names(sortAgents([a, b], 'most-connectors'))).toEqual(['b', 'a'])
  })

  it('orders by addedAt descending for Newest, comparing ISO dates as strings', () => {
    expect(names(sortAgents(ALL, 'newest'))).toEqual(['apple', 'mango', 'zebra'])
  })

  it('sorts an agent with no addedAt last rather than first', () => {
    const undated = agent({ id: 'undated', installs: 10_000 })
    expect(names(sortAgents([undated, ZEBRA], 'newest'))).toEqual(['zebra', 'undated'])
  })
})
