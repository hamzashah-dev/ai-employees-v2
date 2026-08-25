import { useCallback, useState } from 'react'
import { useChatStore } from '@/modules/core/stores/chat-store'

export interface ScreenActionsState {
  /** True only while a turn is actually in flight — otherwise there is nothing to stop. */
  canStop: boolean
  isStopping: boolean
  stop: () => void
}

/**
 * The one action under the screen that is really wired.
 *
 * Reuses the store's `stop`, which is `session.interrupt` over the gateway — the
 * same call the composer's stop button makes. Interrupting a session with no
 * live turn is a no-op server-side, but the button is disabled anyway so the
 * control's state says what it will do.
 */
export function useScreenActions(profile: string): ScreenActionsState {
  const working = useChatStore((state) => state.threads[profile]?.status === 'working')
  const [isStopping, setIsStopping] = useState(false)

  const stop = useCallback(() => {
    setIsStopping(true)
    void useChatStore
      .getState()
      .stop(profile)
      .finally(() => setIsStopping(false))
  }, [profile])

  return { canStop: working, isStopping, stop }
}
