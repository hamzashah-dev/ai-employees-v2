import { useCallback, useMemo } from 'react'
import type { ClarifyRequest } from '@/modules/core/services/hermes/types'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { ChatMessage, EmployeeThread, ToolCall } from '@/modules/core/types/chat'

export interface BrowserView {
  /** noVNC page URL, or null when we have no live view (the usual case today). */
  liveUrl: string | null
  /** True while the agent is running a browser_* tool this turn. */
  agentBrowsing: boolean
  /**
   * The `browser_*` calls of the turn in flight, in the order they were started.
   *
   * This is the whole of what the app can say about what the browser is *doing*: each call
   * carries Hermes' own `tool.start.context` label ("Opening ads.google.com") and a status,
   * and nothing else. There are no timestamps — `tool.start` carries none and the store
   * keeps none — so the dock states the steps without claiming when they happened.
   */
  steps: ToolCall[]
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
  /*
   * The message is selected, the steps are derived.
   *
   * A selector that built the array itself would return a new reference on every render —
   * `useSyncExternalStore` compares snapshots by identity, so that is an infinite loop, not
   * merely a wasted render. The message object is a stable reference between store commits,
   * which makes it a legal snapshot and `useMemo` the right place for the walk.
   */
  const current = useChatStore((state) => {
    const messages = state.threads[profile]?.messages
    return messages?.[messages.length - 1]
  })
  const steps = useMemo(() => browserSteps(current), [current])

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
    steps,
    clarify,
    answer,
  }
}

/**
 * The current turn's browser calls, oldest first.
 *
 * Read off `segments` rather than `Object.values(toolCalls)`, because the segment list is
 * the only thing in the message that preserves arrival order — the record is keyed by
 * `tool_id` and a provider's ids are not ordered.
 *
 * Scoped to the last message for the same reason `isAgentBrowsing` is: a `browser_*` row on
 * an older message belongs to a turn that is over, and replaying it as the current session
 * would show a finished job as a live one.
 */
function browserSteps(current: ChatMessage | undefined): ToolCall[] {
  if (!current) return EMPTY_STEPS

  const steps = current.segments.flatMap((segment) => {
    if (segment.type !== 'tool_call') return []
    const call = current.toolCalls[segment.toolCallId]
    return call && call.name.startsWith('browser_') ? [call] : []
  })

  // One shared empty array, so a thread that never browses hands the dock the same
  // reference every time rather than a fresh one per turn.
  return steps.length > 0 ? steps : EMPTY_STEPS
}

const EMPTY_STEPS: ToolCall[] = []

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
