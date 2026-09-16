import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getHermes } from '../use-hermes'
import type { ThreadRef } from '@/modules/core/services/hermes/session-manager'

/**
 * Start a new conversation with an employee.
 *
 * Deliberately not called on mount anywhere. `session.create` writes a row the
 * moment it is called, so opening an employee's page would leave an empty
 * session in their history every time somebody merely looked — which is what
 * the session list would then be full of. Creation is bound to an actual first
 * message, or to an explicit "New session" click.
 *
 * The returned ref is the durable address; the caller navigates to it so the
 * user lands in the conversation their message went to.
 */
export function useStartSession(profile: string): () => Promise<ThreadRef> {
  const queryClient = useQueryClient()

  return useCallback(async () => {
    const sessionId = await getHermes().sessions.createSession(profile)
    // The list is stale the instant this returns, and the user is usually about
    // to navigate back to it.
    void queryClient.invalidateQueries({ queryKey: ['sessions', profile] })
    return { profile, sessionId }
  }, [profile, queryClient])
}
