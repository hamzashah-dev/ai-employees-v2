import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { PROFILES_QUERY_KEY } from '../../constants'

/**
 * One employee out of the roster.
 *
 * Deliberately the same `['profiles']` key and fetcher the roster uses, so
 * opening the panel reads the cache instead of refetching; `select` narrows to
 * this profile without giving the query its own cache entry.
 */
export function useEmployeeProfile(
  profile: string,
): UseQueryResult<HermesProfile | undefined, Error> {
  return useQuery({
    queryKey: [PROFILES_QUERY_KEY],
    queryFn: fetchProfiles,
    select: (profiles) => profiles.find((entry) => entry.name === profile),
  })
}
