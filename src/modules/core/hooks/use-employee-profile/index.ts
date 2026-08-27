import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchProfiles } from '../../services/hermes/rest'
import type { HermesProfile } from '../../services/hermes/types'

/**
 * One employee out of the roster.
 *
 * Deliberately the same `['profiles']` key and fetcher the roster uses, so
 * opening the panel reads the cache instead of refetching; `select` narrows to
 * this profile without giving the query its own cache entry.
 *
 * In `core` rather than in the panel because the panel and the thread's employee
 * modal both need it — and because `HermesProfile.path` is the only thing Hermes
 * gives us to scope a files call by, so anything reading an employee's workspace
 * has to start here.
 */
export function useEmployeeProfile(
  profile: string,
): UseQueryResult<HermesProfile | undefined, Error> {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    select: (profiles) => profiles.find((entry) => entry.name === profile),
  })
}
