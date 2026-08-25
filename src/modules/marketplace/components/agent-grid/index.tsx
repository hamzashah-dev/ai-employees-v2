import type { FC } from 'react'
import type { CatalogAgent } from '../../constants/catalog'
import { AgentCard } from '../agent-card'

interface AgentGridProps {
  agents: readonly CatalogAgent[]
  /** Lowercased profile names already on the roster. */
  installed: ReadonlySet<string>
}

/**
 * Cards are 336 wide and never narrower than the viewport allows, so the shelf
 * drops a column at a time instead of squeezing.
 */
export const AgentGrid: FC<AgentGridProps> = ({ agents, installed }) => (
  <ul className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(336px,100%),1fr))]">
    {agents.map((agent) => (
      <li key={agent.id} className="flex">
        <AgentCard agent={agent} installed={installed.has(agent.id.toLowerCase())} />
      </li>
    ))}
  </ul>
)
