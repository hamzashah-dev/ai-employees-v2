import type { FC } from 'react'
import { CatalogSection } from './components/catalog-section'
import { CategoryChips } from './components/category-chips'
import { EmptyState } from './components/empty-state'
import { SearchField } from './components/search-field'
import { useMarketplace } from './hooks/use-marketplace'

/**
 * D15 — Marketplace, Discover.
 *
 * Browsing is local: the shelf is a hand-authored constant because Hermes has
 * no catalog to ask. Installing is not — it creates a real profile, and the
 * roster query is what tells a card it is already hired.
 *
 * The canvas draws the content column `overflow:hidden` because it is a single
 * 1600×900 artboard. Thirteen shelves do not fit in a viewport, so the column
 * scrolls here, and the last row gets the bottom padding the artboard never
 * needed — the one place this page departs from it.
 */
export const MarketplaceView: FC = () => {
  const { query, setQuery, category, setCategory, search, shelves, installed, clearFilters } =
    useMarketplace()

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
        <header className="flex flex-col items-center gap-3 pt-4 text-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-lg font-medium text-primary">Agent Marketplace</h1>
            <p className="text-body-md text-secondary">
              Whole agents you hire into your roster — each runs on its own computer and
              comes back finished.
            </p>
          </div>
          <SearchField value={query} onChange={setQuery} />
        </header>

        {/*
          The link is `shrink-0`, so without the wrap the chips are squeezed into a
          single-file column on a phone and the link still hangs past the edge.
        */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CategoryChips value={category} onChange={setCategory} />
          {/*
            Skills an agent can *use* live in /ai-market — a different surface of the
            product, linked and never merged, so this is a plain cross-app link rather
            than a route.
          */}
          <a
            href="/ai-market"
            className="shrink-0 pt-2 text-label-sm text-brand hover:text-brand-hover"
          >
            Looking for skills? AI Market ↗
          </a>
        </div>

        {shelves.length === 0 ? (
          <EmptyState query={search} onClear={clearFilters} />
        ) : (
          shelves.map((shelf, index) => (
            <CatalogSection
              key={shelf.category}
              category={shelf.category}
              agents={shelf.agents}
              installed={installed}
              first={index === 0}
            />
          ))
        )}
      </div>
    </div>
  )
}
