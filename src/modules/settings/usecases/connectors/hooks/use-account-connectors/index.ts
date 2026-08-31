import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMcpServers,
  setMcpServerEnabled,
} from '@/modules/core/services/hermes/rest'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'
import { ACCOUNT_CONNECTORS_PROFILE } from '../../../../constants'

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
 * **Knowingly duplicates `@/modules/thread/hooks/use-connectors`.** That hook is
 * keyed per profile and lives in another feature module, so importing it from here
 * would break the one hard rule in `apps/employees/CLAUDE.md` (a feature module may
 * import `modules/core` and `@repo/*` only). Both hooks wrap the same two rest
 * functions over the same `['mcp-servers', profile]` cache key, which is exactly
 * the second-consumer signal the folder convention promotes on: the shared half
 * belongs in `modules/core/hooks/use-mcp-servers`, taking the profile as an
 * argument, with the thread's version passing an employee and this one passing
 * {@link ACCOUNT_CONNECTORS_PROFILE}. Delete both after that move.
 *
 * The search lives here rather than in the view because `index.tsx` is JSX and
 * `cn()`; filtering on the raw wire fields (name, and the URL or launch command)
 * is logic, and testable without rendering.
 */
export function useAccountConnectors(): AccountConnectors {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')

  const servers = useQuery({
    queryKey: ['mcp-servers', ACCOUNT_CONNECTORS_PROFILE],
    queryFn: () => fetchMcpServers(ACCOUNT_CONNECTORS_PROFILE),
  })

  const mutation = useMutation({
    mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) =>
      setMcpServerEnabled(name, enabled, ACCOUNT_CONNECTORS_PROFILE),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['mcp-servers', ACCOUNT_CONNECTORS_PROFILE],
      }),
  })

  const list = servers.data ?? []
  const search = query.trim().toLowerCase()

  /*
   * Matched against the raw wire fields — the name, and whichever of the URL or the
   * launch command the transport uses. Searching for `notion.com` or for `npx`
   * therefore finds the server it belongs to, which is the whole reason a list of
   * five to fifty MCP entries gets a search box at all.
   */
  const results = useMemo(() => {
    const all = servers.data ?? []
    if (search.length === 0) return all
    return all.filter((server) =>
      [server.name, server.url ?? '', server.command ?? '']
        .join(' ')
        .toLowerCase()
        .includes(search),
    )
  }, [servers.data, search])

  return {
    query,
    setQuery,
    servers: list,
    results,
    connectedCount: list.filter((server) => server.enabled).length,
    isLoading: servers.isLoading,
    error: servers.error,
    toggle: (server) => mutation.mutate({ name: server.name, enabled: !server.enabled }),
    pendingName: mutation.isPending ? mutation.variables?.name : undefined,
  }
}
