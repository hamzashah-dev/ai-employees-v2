import { useEffect } from 'react'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { EmployeeThread } from '@/modules/core/types/chat'

export interface ThreadState {
  /** Undefined until the store has created the thread, which hydrate does. */
  thread: EmployeeThread | undefined
  connection: ConnectionState
}

/**
 * Subscribes to one employee's thread and makes sure its history is loaded.
 *
 * `hydrate` is idempotent per profile, so re-running it on every profile change
 * costs nothing when the thread is already in memory.
 */
export function useThread(profile: string): ThreadState {
  const thread = useChatStore((state) => state.threads[profile])
  const connection = useChatStore((state) => state.connection)

  useEffect(() => {
    void useChatStore.getState().hydrate(profile)
  }, [profile])

  return { thread, connection }
}
