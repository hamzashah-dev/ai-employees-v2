import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import type { CatalogAgent } from '../../constants/catalog'
import { AgentCard } from '../agent-card'
import { useShelf } from './hooks/use-shelf'

interface AgentGridProps {
  agents: readonly CatalogAgent[]
  /** Lowercased profile names already on the roster. */
  installed: ReadonlySet<string>
  /** Show everything at once — the page is already narrowed by a filter. */
  unlimited?: boolean
}

/**
 * The card grid, shared by a category shelf and by the flat list the Community
 * and Made-by-Imagine tabs draw.
 *
 * Three across at the top of the ladder, per the user's reference image,
 * stepping down the way the rest of the app does — the reference is one desktop
 * screenshot and is no authority on a breakpoint.
 *
 * `pt-8` and the 32px row gap are the same number twice: every card's figure
 * bleeds 24px above its top border, so the first row and every row after it need
 * clearance or a figure lands on the card above.
 *
 * The reveal is `col-span-full`, which puts it centred in the row *after* the
 * last full one — the row the withheld cards would have occupied.
 */
export const AgentGrid: FC<AgentGridProps> = ({ agents, installed, unlimited }) => {
  const { visible, hidden, showAll } = useShelf(agents.length, unlimited)

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 pt-8 tablet:grid-cols-2 desktop-sm:grid-cols-3">
      {agents.slice(0, visible).map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          installed={installed.has(agent.id.toLowerCase())}
        />
      ))}

      {hidden > 0 ? (
        <div className="col-span-full flex items-center justify-center">
          <Button variant="secondary" size="sm" shape="pill" onClick={showAll}>
            Show more {hidden}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
