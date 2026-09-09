import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSessionMessages } from '@/modules/core/services/hermes/rest'
import { toSessionMessage } from '../../utils/session-message'
import type { SessionMessage } from '../../types'

export interface UseSessionDetailResult {
  messages: SessionMessage[]
  isLoading: boolean
  error: Error | null
}

/** One session's transcript (§s35), read once — this view does not stream. */
export function useSessionDetail(sessionId: string, profile: string): UseSessionDetailResult {
  const query = useQuery({
    queryKey: ['session-messages', profile, sessionId],
    queryFn: () => fetchSessionMessages(sessionId, profile, { limit: 200 }),
    enabled: Boolean(sessionId && profile),
  })

  const messages = useMemo(
    () => (query.data ?? []).map(toSessionMessage).filter((message) => message.text.length > 0),
    [query.data],
  )

  return { messages, isLoading: query.isPending, error: query.error }
}
