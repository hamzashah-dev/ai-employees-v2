import { useEffect, useMemo } from 'react'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import { refKey, type ThreadRef } from '@/modules/core/services/hermes/session-manager'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { EmployeeThread } from '@/modules/core/types/chat'

export interface ThreadState {
  /** Undefined until the store has created the thread, which hydrate does. */
  thread: EmployeeThread | undefined
  connection: ConnectionState
}

/**
 * Subscribes to one conversation and makes sure its history is loaded.
 *
 * Keyed by profile AND session: an employee holds several conversations, and
 * subscribing by profile alone showed whichever one the store happened to have
 * written last.
 *
 * `hydrate` is idempotent per ref, so re-running it on every navigation costs
 * nothing when the transcript is already in memory.
 */
export function useThread(ref: ThreadRef): ThreadState {
  const key = refKey(ref)
  const thread = useChatStore((state) => state.threads[key])
  const connection = useChatStore((state) => state.connection)

  /*
   * The ref is rebuilt on every render by most callers, so depend on the two
   * strings rather than the object — otherwise the effect re-runs forever.
   */
  const stable = useMemo(
    () => ({ profile: ref.profile, sessionId: ref.sessionId }),
    [ref.profile, ref.sessionId],
  )

  useEffect(() => {
    void useChatStore.getState().hydrate(stable)
  }, [stable])

  return { thread, connection }
}
