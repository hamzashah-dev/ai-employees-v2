import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import type { CatalogAgent } from '../../constants/catalog'
import {
  CATEGORY_STYLES,
  CATEGORY_SUBTITLES,
  type AgentCategory,
} from '../../constants/categories'
import { AgentCard } from '../agent-card'
import { useShelf } from './hooks/use-shelf'

interface CatalogSectionProps {
  category: AgentCategory
  agents: readonly CatalogAgent[]
  /** Lowercased profile names already on the roster. */
  installed: ReadonlySet<string>
  /** The first shelf sits a little further from the filter row than the rest. */
  first?: boolean
}

/**
 * One category's shelf: header, a four-column grid, and the tile that reveals the
 * rest. "Show more <n>" counts the agents actually withheld, so a shelf with
 * nothing more to give does not offer.
 */
export const CatalogSection: FC<CatalogSectionProps> = ({
  category,
  agents,
  installed,
  first,
}) => {
  const { visible, hidden, showAll } = useShelf(agents.length)
  const { Icon, color } = CATEGORY_STYLES[category]

  return (
    <section aria-label={category} className={cn('flex flex-col gap-4 pt-2', { 'pt-4': first })}>
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

      <div className="grid grid-cols-4 gap-4 pt-6">
        {agents.slice(0, visible).map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            installed={installed.has(agent.id.toLowerCase())}
          />
        ))}

        {hidden > 0 ? (
          <div className="col-start-3 col-end-5 flex items-center justify-center">
            <Button
              variant="secondary"
              size="none"
              className="h-9 rounded-[18px] px-5 text-label-md"
              onClick={showAll}
            >
              Show more {hidden}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
