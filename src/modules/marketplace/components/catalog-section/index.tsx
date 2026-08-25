import type { FC } from 'react'
import type { CatalogAgent } from '../../constants/catalog'
import {
  CATEGORY_STYLES,
  CATEGORY_SUBTITLES,
  type AgentCategory,
} from '../../constants/categories'
import { AgentGrid } from '../agent-grid'

interface CatalogSectionProps {
  category: AgentCategory
  agents: readonly CatalogAgent[]
  /** Lowercased profile names already on the roster. */
  installed: ReadonlySet<string>
}

/**
 * One category's shelf: header, then a grid of whole rows with the pill that
 * reveals the rest. "Show more <n>" counts the agents actually withheld, so a
 * shelf with nothing more to give does not offer.
 *
 * Only the Discover tab, unnarrowed, draws shelves. Once a category or a maker
 * tab is active the page renders a flat {@link AgentGrid} instead: the header
 * would be the same two strings the control row already prints.
 */
export const CatalogSection: FC<CatalogSectionProps> = ({ category, agents, installed }) => {
  const { Icon, color } = CATEGORY_STYLES[category]

  return (
    <section aria-label={category} className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2.5">
        <span
          className="flex size-6 shrink-0 items-center justify-center self-center rounded-lg"
          style={{ backgroundColor: color }}
        >
          <Icon className="size-3.5 text-black/60" />
        </span>
        <h2 className="text-label-lg font-medium text-primary">{category}</h2>
        <p className="text-label-sm text-tertiary">{CATEGORY_SUBTITLES[category]}</p>
      </div>

      <AgentGrid agents={agents} installed={installed} />
    </section>
  )
}
