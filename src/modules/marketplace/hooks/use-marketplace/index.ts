import { useMemo, useState } from 'react'
import { CATALOG, type CatalogAgent } from '../../constants/catalog'
import {
  AGENT_CATEGORIES,
  CATEGORY_SUBTITLES,
  type AgentCategory,
  type MarketplaceCategory,
} from '../../constants/categories'
import { DEFAULT_SORT, type AgentSortId } from '../../constants/sort'
import { filterAgents, type MakerId } from '../../utils/filter-agents'
import { sortAgents } from '../../utils/sort-agents'
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
  maker: MakerId
  setMaker: (maker: MakerId) => void
  sort: AgentSortId
  setSort: (sort: AgentSortId) => void
  /** The trimmed query — what the empty state quotes back. */
  search: string
  /** The active category's own line, shown under the control row. `All` has none. */
  blurb?: string
  /** D16's `Agents 4 of 26`: what survived the filter, over the whole catalog. */
  matched: number
  total: number
  /** Everything that matched, in the chosen order. */
  results: CatalogAgent[]
  /**
   * `results` grouped back into category shelves. Only meaningful while
   * {@link Marketplace.grouped} is true.
   */
  shelves: Shelf[]
  /** Whether to draw category shelves rather than one flat grid. */
  grouped: boolean
  /** Lowercased profile names already on the roster. */
  installed: ReadonlySet<string>
  clearFilters: () => void
}

/** The unfiltered page: the Discover tab with no category chosen. */
const DEFAULT_MAKER: MakerId = 'discover'

/**
 * The whole page state.
 *
 * Search, the maker tabs, the category dropdown and the sort feed one code path:
 * filter the catalog, order what survives, then group it back into category
 * shelves. A shelf that matches nothing simply does not render.
 *
 * Shelves are drawn only on the unnarrowed Discover tab — the tab the reference
 * gives the category bands to. Anywhere else the page is already about one thing
 * and a header row would repeat the control row's own label back at the reader,
 * which is a large part of why this page read as scattered.
 *
 * `clearFilters` resets the tab as well as the search and the category, because
 * the empty state it sits under may be the tab's doing; a "Clear filters" that
 * leaves the page empty is worse than no button. It deliberately leaves `sort`
 * alone: sort is a preference about how to read the page, not a filter narrowing
 * it, so a page showing nothing is never the sort's fault.
 */
export function useMarketplace(): Marketplace {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory>('All')
  const [maker, setMaker] = useState<MakerId>(DEFAULT_MAKER)
  const [sort, setSort] = useState<AgentSortId>(DEFAULT_SORT)
  const installed = useInstalledAgents()

  const search = query.trim()
  const grouped = maker === DEFAULT_MAKER && category === 'All'

  const { results, shelves } = useMemo(() => {
    const matches = sortAgents(filterAgents(CATALOG, { query: search, category, maker }), sort)

    return {
      results: matches,
      shelves: AGENT_CATEGORIES.map((name) => ({
        category: name,
        agents: matches.filter((agent) => agent.category === name),
      })).filter((shelf) => shelf.agents.length > 0),
    }
  }, [search, category, maker, sort])

  return {
    query,
    setQuery,
    category,
    setCategory,
    maker,
    setMaker,
    sort,
    setSort,
    search,
    blurb: category === 'All' ? undefined : CATEGORY_SUBTITLES[category],
    matched: results.length,
    total: CATALOG.length,
    results,
    shelves,
    grouped,
    installed,
    clearFilters: () => {
      setQuery('')
      setCategory('All')
      setMaker(DEFAULT_MAKER)
    },
  }
}
