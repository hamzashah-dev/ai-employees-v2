import type { FC, ReactNode } from 'react'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
import { ACCOUNT_PROFILE } from '@/modules/core/constants/account'
import { useMcpServers } from '@/modules/core/hooks/use-mcp-servers'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'

interface NavConnectorCountProps {
  /** What the row shows before the listing answers — its static badge, or nothing. */
  children?: ReactNode
}

/**
 * How many integrations this install has, on the `Integrations` row.
 *
 * Its own component for the same reason `NavLiveIndicator` is one: only the row that opts
 * in holds the query, so the other rows do not re-render — or fetch — for a number they
 * do not draw.
 *
 * It counts *servers*, not enabled ones. `enabled` is a config flag Hermes reads when a
 * turn starts, and a row that read "1" while three were configured would be describing a
 * setting rather than the thing the destination lists. Settings › Connectors, one click
 * away, is where on-and-off is stated — and it reads the same cache entry, so the two
 * cannot disagree.
 *
 * Nothing is drawn while the listing is loading or failed: a count is a fact, and `0` is a
 * different claim from "not asked yet".
 */
export const NavConnectorCount: FC<NavConnectorCountProps> = ({ children }) => {
  const isCollapsed = useSidebarCollapsed()
  const { servers, isLoading, error } = useMcpServers(ACCOUNT_PROFILE)

  if (isLoading || error || servers.length === 0) return <>{children}</>
  if (isCollapsed) return null

  return (
    <Badge
      size="md"
      variant="neutral-subtle"
      aria-label={`${servers.length} ${servers.length === 1 ? 'integration' : 'integrations'}`}
      className={cn('shrink-0 rounded-full px-2 tabular-nums text-primary')}
    >
      {servers.length}
    </Badge>
  )
}
