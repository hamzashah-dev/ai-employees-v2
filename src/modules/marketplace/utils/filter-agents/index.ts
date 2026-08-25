import type { CatalogAgent } from '../../constants/catalog'
import type { MarketplaceCategory } from '../../constants/categories'

export interface AgentFilter {
  /** Free text, matched case-insensitively against name and tagline. */
  query: string
  category: MarketplaceCategory
}

export function filterAgents(
  agents: readonly CatalogAgent[],
  { query, category }: AgentFilter,
): CatalogAgent[] {
  const needle = query.trim().toLowerCase()

  return agents.filter((agent) => {
    if (category !== 'All' && agent.category !== category) return false
    if (needle === '') return true
    return (
      agent.name.toLowerCase().includes(needle) ||
      agent.tagline.toLowerCase().includes(needle)
    )
  })
}

/** Most-installed first — the catalog's only ordering signal. */
export function byInstalls(agents: readonly CatalogAgent[]): CatalogAgent[] {
  return [...agents].sort((a, b) => b.installs - a.installs)
}
