import { useCallback } from 'react'
import type { ClarifyRequest } from '@/modules/core/services/hermes/types'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { EmployeeThread } from '@/modules/core/types/chat'

export interface BrowserView {
  /** noVNC page URL, or null when we have no live view (the usual case today). */
  liveUrl: string | null
  /** True while the agent is running a browser_* tool this turn. */
  agentBrowsing: boolean
  /** Set when the agent has asked the human for something (e.g. a login). */
  clarify: ClarifyRequest | null
  /** Answer the open clarify request. */
  answer: (text: string) => void
}

/**
 * What the panel can honestly say about the employee's browser.
 *
 * Three signals, and only two of them have a source today.
 *
 * **`liveUrl` arrives late or not at all.** It rides on a `browser_navigate`
 * tool RESULT — there is no browser-session event and nothing to poll — so it
 * is null until the agent's first navigation of the session completes, and it
 * stays null for a profile whose browser tool is not camofox-backed or whose
 * VNC plugin reports `running: false`. Treat it as something you may not have
 * and render the no-live-view state; never guess an address.
 *
 * `agentBrowsing` and `clarify` are real, and come from state we already hold.
 */
export function useBrowserView(profile: string): BrowserView {
  const clarify = useChatStore((state) => state.threads[profile]?.clarify ?? null)
  const liveUrl = useChatStore((state) => state.threads[profile]?.liveUrl ?? null)
  const agentBrowsing = useChatStore((state) => isAgentBrowsing(state.threads[profile]))

  /**
   * Answering goes through the store, not straight at the session manager.
   *
   * The store's `answerClarify` is what clears `thread.clarify` on success and —
   * the part that matters — deliberately LEAVES the card standing on failure,
   * with the error on the thread. The agent is parked inside `_block()` until a
   * response lands, so hiding the card after a failed send would strand it with
   * no way through: the human would see the question disappear while the agent
   * waited out its (1h-by-default, possibly infinite) timeout.
   */
  const answerClarify = useChatStore((state) => state.answerClarify)

  const answer = useCallback(
    (text: string) => {
      // Fire-and-forget at this level: the store owns both outcomes.
      void answerClarify(profile, text)
    },
    [answerClarify, profile],
  )

  return {
    liveUrl,
    agentBrowsing,
    clarify,
    answer,
  }
}

/**
 * Only the open turn counts: a `browser_*` call left `running` on an older
 * message is an orphan the reaper has already marked `failed`, not an agent
 * still browsing.
 *
 * Exported because the shell auto-opens the drawer off the same signal, and it
 * cannot ask the drawer: the drawer is unmounted while closed. Hydrated history
 * never trips it (replayed tool calls land `done`) and an interrupt clears it
 * (the reaper marks leftovers `failed`), which is what makes it safe to key an
 * effect on.
 */
export function isAgentBrowsing(thread: EmployeeThread | undefined): boolean {
  const current = thread?.messages[thread.messages.length - 1]
  if (!current) return false
  return Object.values(current.toolCalls).some(
    (call) => call.status === 'running' && call.name.startsWith('browser_'),
  )
}
