import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '@/modules/core/services/hermes/rest'
import type { HermesSessionRow } from '@/modules/core/services/hermes/types'

export interface UseSessionRowsResult {
  rows: HermesSessionRow[]
  isLoading: boolean
  error: Error | null
}

/**
 * One employee's sessions, straight off `GET /api/sessions?profile=`.
 *
 * In `core` because two feature modules need it and neither may reach into the
 * other: the sessions list groups these rows into the employee's home, and the
 * thread reads one row out of them for the header's title — Hermes titles a
 * session with an LLM after the fact and no gateway event carries that title,
 * so the REST row is the only place it exists.
 *
 * One query key, so both surfaces share a cache rather than each fetching the
 * same fifty rows.
 */
export function useSessionRows(profile: string): UseSessionRowsResult {
  const query = useQuery({
    queryKey: ['sessions', profile],
    queryFn: () => fetchSessions(profile, { limit: 50, order: 'recent' }),
    enabled: Boolean(profile),
  })

  return { rows: query.data ?? [], isLoading: query.isPending, error: query.error }
}
