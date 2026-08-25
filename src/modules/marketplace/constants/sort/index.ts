/**
 * The sort dropdown's rows, in the order §6 pins them.
 *
 * Ids and labels are split on purpose: the label carries the design's en dash
 * (`A–Z`), which is the kind of character a comparator's `switch` gets wrong
 * once and then silently falls through forever. Compare on `id`, render
 * `label`.
 *
 * Constants only — the comparators live with the grid. Each one has a field
 * behind it in the catalog: `installs` for Recommended, `name` for A–Z,
 * `connectors` for Most connectors, `addedAt` for Newest.
 */
export interface SortOption {
  id: string
  label: string
}

export const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'a-z', label: 'A–Z' },
  { id: 'most-connectors', label: 'Most connectors' },
  { id: 'newest', label: 'Newest' },
] as const satisfies readonly SortOption[]

export type AgentSortId = (typeof SORT_OPTIONS)[number]['id']

/** What the dropdown opens on, and what D16 draws with a check beside it. */
export const DEFAULT_SORT: AgentSortId = 'recommended'
