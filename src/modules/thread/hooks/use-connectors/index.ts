import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMcpServers,
  setMcpServerEnabled,
} from '@/modules/core/services/hermes/rest'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'

export interface UseConnectorsResult {
  servers: HermesMcpServer[]
  enabledCount: number
  isLoading: boolean
  error: Error | null
  toggle: (server: HermesMcpServer) => void
  pendingName?: string
}

/**
 * The employee's MCP servers.
 *
 * Promoted out of the composer's dropdown once the employee info modal needed the same
 * list: one `['mcp-servers', profile]` cache entry now serves both, so opening the modal
 * over a composer that has already fetched costs nothing and a toggle in either place
 * invalidates the other.
 *
 * The query is not gated on any open/closed state — the count on the composer's closed
 * trigger needs it eagerly, and it is one config read.
 */
export function useConnectors(profile: string): UseConnectorsResult {
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
