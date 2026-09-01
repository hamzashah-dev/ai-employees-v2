import { useMemo, useState } from 'react'
import { ACCOUNT_PROFILE } from '@/modules/core/constants/account'
import { useMcpServers } from '@/modules/core/hooks/use-mcp-servers'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'

export interface AccountConnectors {
  /** The search box's text, unfiltered and untrimmed. */
  query: string
  setQuery: (query: string) => void
  /** Everything Hermes returned — what the count line counts. */
  servers: HermesMcpServer[]
  /** What survived the search — what the list draws. */
  results: HermesMcpServer[]
  /**
   * How many are switched on.
   *
   * `enabled` is a config flag Hermes reads when a turn starts, not a live socket:
   * nothing on `GET /api/mcp/servers` reports whether a server is reachable or
   * signed in. `POST /api/mcp/servers/{name}/test` is the only route that knows,
   * and it finds out by opening a connection — which a page must not do once per
   * row to draw a count.
   */
  connectedCount: number
  isLoading: boolean
  error: Error | null
  toggle: (server: HermesMcpServer) => void
  /** The row with a write in flight, so it can show it. */
  pendingName?: string
}

/**
 * The account's connectors — which in Hermes means the install's own MCP servers.
 *
 * The listing and the toggle are `modules/core`'s `useMcpServers`, which is where they
 * moved once a third surface — the sidebar's `Integrations` count — wanted them. This
 * hook is what is genuinely account-specific: {@link ACCOUNT_PROFILE} as the scope, and
 * the search box.
 *
 * The search lives here rather than in the view because `index.tsx` is JSX and
 * `cn()`; filtering on the raw wire fields (name, and the URL or launch command)
 * is logic, and testable without rendering.
 */
export function useAccountConnectors(): AccountConnectors {
  const [query, setQuery] = useState('')
  const { servers, isLoading, error, toggle, pendingName } = useMcpServers(ACCOUNT_PROFILE)

  const search = query.trim().toLowerCase()

  /*
   * Matched against the raw wire fields — the name, and whichever of the URL or the
   * launch command the transport uses. Searching for `notion.com` or for `npx`
   * therefore finds the server it belongs to, which is the whole reason a list of
   * five to fifty MCP entries gets a search box at all.
   */
  const results = useMemo(() => {
    if (search.length === 0) return servers
    return servers.filter((server) =>
      [server.name, server.url ?? '', server.command ?? '']
        .join(' ')
        .toLowerCase()
        .includes(search),
    )
  }, [servers, search])

  return {
    query,
    setQuery,
    servers,
    results,
    connectedCount: servers.filter((server) => server.enabled).length,
    isLoading,
    error,
    toggle,
    ...(pendingName ? { pendingName } : {}),
  }
}
