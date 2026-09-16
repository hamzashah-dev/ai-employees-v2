import { useSessionRows } from '@/modules/core/hooks/use-session-rows'
import { groupSessions } from '../../utils/group-sessions'
import type { SessionGroup } from '../../types'

export interface UseEmployeeSessionsResult {
  groups: SessionGroup[]
  isLoading: boolean
  error: Error | null
}

/**
 * One employee's session history, bucketed for the list.
 *
 * `fetchSessions` already excludes archived rows and anything with zero
 * messages (`min_messages: '1'`), so a profile that has never been messaged
 * answers an empty list rather than a row of noise.
 */
export function useEmployeeSessions(profile: string): UseEmployeeSessionsResult {
  const { rows, isLoading, error } = useSessionRows(profile)
  return { groups: groupSessions(rows), isLoading, error }
}
