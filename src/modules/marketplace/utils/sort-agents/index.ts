import type { CatalogAgent } from '../../constants/catalog'
import type { AgentSortId } from '../../constants/sort'

/**
 * The four orders §6 pins, each reading a field the catalog genuinely carries.
 *
 * Two of them are honest about a thin field rather than dressed up:
 *
 * - `most-connectors` only twelve of the catalog's agents declare connectors at
 *   all, so the rest score zero and hold their catalog order behind them. That
 *   is a real ordering over real data; padding the other eighty-three with
 *   invented connector lists is the fabrication CLAUDE.md rules out.
 * - `newest` reads `addedAt`, which every catalog entry carries — `CatalogEntry`
 *   makes omitting it a compile error. It is a display date, not a Hermes
 *   timestamp: Hermes has no created-at for a profile. An entry without one
 *   (only a test fixture, today) sorts last rather than to the top, which is
 *   why the missing value is `''` and not something that would win the compare.
 *
 * ISO `YYYY-MM-DD` compares correctly as a string, so no `Date` is constructed.
 *
 * Every comparator falls back to `installs`, so an order is total rather than
 * "whatever the catalog array happened to say" — a stable sort would keep ties
 * deterministic, but not *meaningfully* ordered.
 */
const COMPARATORS: Record<AgentSortId, (a: CatalogAgent, b: CatalogAgent) => number> = {
  recommended: (a, b) => b.installs - a.installs,
  'a-z': (a, b) => a.name.localeCompare(b.name) || b.installs - a.installs,
  'most-connectors': (a, b) =>
    (b.connectors?.length ?? 0) - (a.connectors?.length ?? 0) || b.installs - a.installs,
  newest: (a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? '') || b.installs - a.installs,
}

/** Copies before sorting — the catalog is a module-level constant. */
export function sortAgents(
  agents: readonly CatalogAgent[],
  sort: AgentSortId,
): CatalogAgent[] {
  return [...agents].sort(COMPARATORS[sort])
}
