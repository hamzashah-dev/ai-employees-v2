import { useMemo, useState, type FC } from 'react'
import { AgentGrid } from './components/agent-grid'
import { CatalogSection } from './components/catalog-section'
import { CategoryChips } from './components/category-chips'
import { EmptyState } from './components/empty-state'
import { SearchField } from './components/search-field'
import { CATALOG } from './constants/catalog'
import {
  AGENT_CATEGORIES,
  CATEGORY_SUBTITLES,
  type MarketplaceCategory,
} from './constants/categories'
import { useInstalledAgents } from './hooks/use-installed-agents'
import { byInstalls, filterAgents } from './utils/filter-agents'

/**
 * D15 — Marketplace, Discover.
 *
 * Browsing is local: the shelf is a hand-authored constant because Hermes has
 * no catalog to ask. Installing is not — it creates a real profile, and the
 * roster query is what tells a card it is already hired.
 */
export const MarketplaceView: FC = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory>('All')
  const installed = useInstalledAgents()

  const search = query.trim()
  const isFiltering = search !== '' || category !== 'All'

  const matches = useMemo(
    () => byInstalls(filterAgents(CATALOG, { query: search, category })),
    [search, category],
  )

  const shelves = useMemo(
    () =>
      AGENT_CATEGORIES.map((name) => ({
        name,
        agents: byInstalls(CATALOG.filter((agent) => agent.category === name)),
      })).filter((shelf) => shelf.agents.length > 0),
    [],
  )

  const clearFilters = (): void => {
    setQuery('')
    setCategory('All')
  }

  return (
    <div className="scrollbar-subtle h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[1200px] px-8 py-14">
        <header className="flex flex-col gap-3">
          <h1 className="text-heading-lg font-medium text-[rgb(var(--color-ink-7))]">
            Agent Marketplace
          </h1>
          <p className="max-w-[720px] text-body text-[rgb(var(--color-ink-7)/0.5)]">
            Whole agents you hire into your roster — each runs on its own computer and
            comes back finished.
          </p>
        </header>

        <div className="mt-10">
          <SearchField value={query} onChange={setQuery} />
        </div>

        <div className="mt-6">
          <CategoryChips value={category} onChange={setCategory} />
        </div>

        <div className="mt-12 flex flex-col gap-14">
          {isFiltering ? (
            matches.length === 0 ? (
              <EmptyState query={search} onClear={clearFilters} />
            ) : (
              <CatalogSection
                title={category === 'All' ? 'Search results' : category}
                subtitle={
                  category === 'All'
                    ? `${matches.length} ${matches.length === 1 ? 'agent' : 'agents'} matching “${search}”.`
                    : CATEGORY_SUBTITLES[category]
                }
              >
                <AgentGrid agents={matches} installed={installed} />
              </CatalogSection>
            )
          ) : (
            shelves.map((shelf) => (
              <CatalogSection
                key={shelf.name}
                title={shelf.name}
                subtitle={CATEGORY_SUBTITLES[shelf.name]}
              >
                <AgentGrid agents={shelf.agents} installed={installed} />
              </CatalogSection>
            ))
          )}
        </div>

        <p className="mt-16 text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">
          Whole agents live here, hired into your roster. Skills an agent can use stay in
          AI Market — linked, never merged.
        </p>
      </div>
    </div>
  )
}
