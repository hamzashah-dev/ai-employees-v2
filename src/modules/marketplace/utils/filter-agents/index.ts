import type { CatalogAgent } from '../../constants/catalog'
import type { MarketplaceCategory } from '../../constants/categories'

/**
 * The three top-level tabs. `discover` is everything; the other two split the
 * catalog on who made an agent.
 */
export const MAKERS = ['discover', 'community', 'imagine'] as const

export type MakerId = (typeof MAKERS)[number]

/**
 * Which agents are first-party.
 *
 * Hermes has no catalogue backend of any kind — no registry, no discovery
 * endpoint, and no author or provenance field on a profile
 * (`computer_cli/web_server.py`). Provenance is therefore hand-authored display
 * data, exactly like `runs` and `installs` in the catalog, and nothing in the
 * app pretends otherwise: there is no author endpoint, no submission flow, no
 * publisher profile and no rating behind these tabs.
 *
 * The twelve are the agents the catalog documents end to end — the nine §6 pins
 * as the real catalogue, plus the three that carry a full duties/connectors/
 * requirements set for the detail screen. That is the only non-arbitrary line
 * available in the data: an agent we have written the whole product surface for
 * is one we are claiming as ours.
 *
 * This list belongs on `CatalogAgent` as a `maker` field, beside `runs` and
 * `installs` and documented the same way. It lives here only because
 * `constants/catalog` is another agent's file in this pass — fold it in and this
 * set collapses to `agent.maker === 'imagine'`.
 */
const MADE_BY_IMAGINE: ReadonlySet<string> = new Set([
  // Ours by authorship — these have packs under agents/.
  'ad-creator',
  'competitor-watch',
  'linkedin-agent',
  'startup-kit-agent',
  'inbox-triage',
  'chief-of-staff',
  'bug-hunter',
  'talent-scout',
  'account-manager',
  'shorts-maker',
  'script-writer',
  'expense-manager',
  'meeting-notes',
  'customer-support',
  'sales-outbound',
  'social-scheduler',
])

export interface AgentFilter {
  /** Free text, matched case-insensitively against name and tagline. */
  query: string
  category: MarketplaceCategory
  maker: MakerId
}

export function filterAgents(
  agents: readonly CatalogAgent[],
  { query, category, maker }: AgentFilter,
): CatalogAgent[] {
  const needle = query.trim().toLowerCase()

  return agents.filter((agent) => {
    if (category !== 'All' && agent.category !== category) return false
    if (maker !== 'discover' && MADE_BY_IMAGINE.has(agent.id) !== (maker === 'imagine')) {
      return false
    }
    if (needle === '') return true
    return (
      agent.name.toLowerCase().includes(needle) ||
      agent.tagline.toLowerCase().includes(needle)
    )
  })
}
