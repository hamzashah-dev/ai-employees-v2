import { useMemo, useState } from 'react'
import { CATALOG, type CatalogAgent } from '../../constants/catalog'
import {
  AGENT_CATEGORIES,
  type AgentCategory,
  type MarketplaceCategory,
} from '../../constants/categories'
import { byInstalls, filterAgents } from '../../utils/filter-agents'
import { useInstalledAgents } from '../use-installed-agents'

export interface Shelf {
  category: AgentCategory
  agents: CatalogAgent[]
}

export interface Marketplace {
  query: string
  setQuery: (query: string) => void
  category: MarketplaceCategory
  setCategory: (category: MarketplaceCategory) => void
  /** The trimmed query — what the empty state quotes back. */
  search: string
  shelves: Shelf[]
  /** Lowercased profile names already on the roster. */
  installed: ReadonlySet<string>
  clearFilters: () => void
}

/**
 * The whole page state.
 *
 * Search and the category chips feed one code path: filter the catalog, then
 * group what survives back into the canvas's category shelves. A search
 * therefore keeps its results under the section headers they belong to instead
 * of collapsing them into a separate "results" list, and a shelf that matches
 * nothing simply does not render.
 */
export function useMarketplace(): Marketplace {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory>('All')
  const installed = useInstalledAgents()

  const search = query.trim()

  const shelves = useMemo(() => {
    const matches = filterAgents(CATALOG, { query: search, category })

    return AGENT_CATEGORIES.map((name) => ({
      category: name,
      agents: byInstalls(matches.filter((agent) => agent.category === name)),
    })).filter((shelf) => shelf.agents.length > 0)
  }, [search, category])

  return {
    query,
    setQuery,
    category,
    setCategory,
    search,
    shelves,
    installed,
    clearFilters: () => {
      setQuery('')
      setCategory('All')
    },
  }
}
