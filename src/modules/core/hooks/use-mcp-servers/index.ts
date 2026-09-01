import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMcpServers,
  setMcpServerEnabled,
} from '@/modules/core/services/hermes/rest'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'

export interface UseMcpServersResult {
  servers: HermesMcpServer[]
  enabledCount: number
  isLoading: boolean
  error: Error | null
  toggle: (server: HermesMcpServer) => void
  pendingName?: string
}

/**
 * A profile's MCP servers.
 *
 * One `['mcp-servers', profile]` cache entry serves every surface that draws them — the
 * composer's dropdown, the integrations dialog behind it, Settings › Connectors and the
 * sidebar's own count — so a toggle in any of them invalidates the others and a second
 * reader costs no request.
 *
 * "Account level" is a profile too: Hermes has no account-scoped MCP surface, every route
 * is `?profile=`-scoped, and {@link ACCOUNT_PROFILE} is the name the install answers under.
 *
 * The query is not gated on any open/closed state — the count on the composer's closed
 * trigger needs it eagerly, and it is one config read.
 */
export function useMcpServers(profile: string): UseMcpServersResult {
  const queryClient = useQueryClient()

  const servers = useQuery({
    queryKey: ['mcp-servers', profile],
    queryFn: () => fetchMcpServers(profile),
  })

  const mutation = useMutation({
    mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) =>
      setMcpServerEnabled(name, enabled, profile),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', profile] }),
  })

  const list = servers.data ?? []

  return {
    servers: list,
    enabledCount: list.filter((server) => server.enabled).length,
    isLoading: servers.isLoading,
    error: servers.error,
    toggle: (server) => mutation.mutate({ name: server.name, enabled: !server.enabled }),
    pendingName: mutation.isPending ? mutation.variables?.name : undefined,
  }
}
