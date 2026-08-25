import type { FC } from 'react'
import { Tabs, TabsContent } from '@repo/ui/tabs'
import { AgentGrid } from './components/agent-grid'
import { CatalogSection } from './components/catalog-section'
import { CategoryMenu } from './components/category-menu'
import { EmptyState } from './components/empty-state'
import { MakerTabs } from './components/maker-tabs'
import { SearchField } from './components/search-field'
import { SortMenu } from './components/sort-menu'
import { useMarketplace } from './hooks/use-marketplace'
import type { MakerId } from './utils/filter-agents'

/**
 * D15/D16 — Marketplace, Discover.
 *
 * Browsing is local: the shelf is a hand-authored constant because Hermes has no
 * catalog to ask — no registry, no discovery endpoint, no author field. So are
 * the three maker tabs, and `utils/filter-agents` says so plainly. Installing is
 * not local: it creates a real profile, and the roster query is what tells a card
 * it is already hired.
 *
 * The frame is the user's own reference (their shipping product), which outranks
 * §6 where the two disagree:
 *
 * - **One control row**, not a centred hero. §6's `heading-lg` title, its lede
 *   and its 640px search bar are gone; the search is a small pill on the row and
 *   the fourteen categories moved into a dropdown. The `h1` survives as
 *   `sr-only`, because the top bar's page title is a `span` and a page with no
 *   heading at all is a real regression for a screen reader.
 * - **`max-w-[1200px]`, centred, with real padding.** §6 says 1568 and this page
 *   briefly shipped it; the user overruled it — their reference sets the grid in
 *   a centred column with air on both sides. Do not "fix" this back to 1568.
 *
 * `Tabs` wraps the tab strip *and* the results, with one `TabsContent` whose
 * value tracks the active tab so it always matches. That is what makes the
 * active trigger's `aria-controls` point at the grid it filters; a bare
 * `TabsList` would leave every trigger pointing at an element that does not
 * exist.
 *
 * The canvas draws the content column `overflow:hidden` because it is a single
 * 1600×900 artboard. Thirteen shelves do not fit in a viewport, so the column
 * scrolls here, and the last row gets the bottom padding the artboard never
 * needed.
 */
export const MarketplaceView: FC = () => {
  const {
    query,
    setQuery,
    category,
    setCategory,
    maker,
    setMaker,
    sort,
    setSort,
    search,
    blurb,
    matched,
    total,
    results,
    shelves,
    grouped,
    installed,
    clearFilters,
  } = useMarketplace()

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 pt-4">
        <h1 className="sr-only">Agent Marketplace</h1>

        <Tabs
          value={maker}
          onValueChange={(next) => setMaker(next as MakerId)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <MakerTabs />
            <div className="flex items-center gap-2">
              <SearchField value={query} onChange={setQuery} />
              <CategoryMenu value={category} onChange={setCategory} />
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {blurb ? <p className="text-label-md text-secondary">{blurb}</p> : null}
              <p className="text-label-sm text-tertiary">
                Agents {matched.toLocaleString()} of {total.toLocaleString()}
              </p>
            </div>
            {/*
              §6's annotation and its single quiet cross-link, in one line rather
              than two places. Skills an agent can *use* live in /ai-market — a
              different surface of the same product, linked and never merged, so
              this is a plain cross-app link and not a route.
            */}
            <p className="text-label-sm text-tertiary">
              Whole agents, hired into your roster. Skills an agent can use live in{' '}
              <a href="/ai-market" className="text-brand hover:text-brand-hover">
                AI Market ↗
              </a>
            </p>
          </div>

          <TabsContent value={maker} className="flex flex-col gap-8">
            {results.length === 0 ? (
              <EmptyState
                query={search}
                scope={category === 'All' ? undefined : category}
                onClear={clearFilters}
              />
            ) : grouped ? (
              shelves.map((shelf) => (
                <CatalogSection
                  key={shelf.category}
                  category={shelf.category}
                  agents={shelf.agents}
                  installed={installed}
                />
              ))
            ) : (
              <AgentGrid agents={results} installed={installed} unlimited />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
