import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchCronJobs } from '@/modules/core/services/hermes/rest'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { ROUTINES_QUERY_KEY } from '../../constants'

/** The scheduled jobs this employee runs on its own. */
export function useRoutines(profile: string): UseQueryResult<HermesCronJob[], Error> {
  return useQuery({
    queryKey: [ROUTINES_QUERY_KEY, profile],
    queryFn: () => fetchCronJobs(profile),
  })
}
