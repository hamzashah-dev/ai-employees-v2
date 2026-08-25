import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchAllCronJobs } from '@/modules/core/services/hermes/rest'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { ALL_ROUTINES_QUERY_KEY } from '../../constants'

/**
 * Every routine across every employee, in one request.
 *
 * `GET /api/cron/jobs?profile=all` fans out server-side and annotates each job
 * with the profile that owns it, so the table costs one call rather than one per
 * employee — and a roster that grows does not grow the request count.
 */
export function useAllRoutines(): UseQueryResult<HermesCronJob[], Error> {
  return useQuery({
    queryKey: ALL_ROUTINES_QUERY_KEY,
    queryFn: fetchAllCronJobs,
  })
}
