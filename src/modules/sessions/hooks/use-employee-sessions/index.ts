import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '@/modules/core/services/hermes/rest'
import { groupSessions } from '../../utils/group-sessions'
import type { SessionGroup } from '../../types'

export interface UseEmployeeSessionsResult {
  groups: SessionGroup[]
  isLoading: boolean
  error: Error | null
}

/**
 * One employee's session history (§s34).
 *
 * `fetchSessions` already excludes archived rows and anything with zero
 * messages (`min_messages: '1'`), so a profile that has never been messaged
 * answers an empty list rather than a row of noise.
 */
export function useEmployeeSessions(profile: string): UseEmployeeSessionsResult {
  const query = useQuery({
    queryKey: ['sessions', profile],
    queryFn: () => fetchSessions(profile, { limit: 50, order: 'recent' }),
    enabled: Boolean(profile),
  })

  return {
    groups: groupSessions(query.data ?? []),
    isLoading: query.isPending,
    error: query.error,
  }
}
