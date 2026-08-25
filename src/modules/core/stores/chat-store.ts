import { create } from 'zustand'
import type { GatewayEvent, ConnectionState } from '../services/hermes/gateway'
import type { SessionManager } from '../services/hermes/session-manager'
import type {
  ApprovalRequest,
  ChatMessage,
  EmployeeStatus,
  EmployeeThread,
  MessageRole,
  ThinkingBlock,
  ToolCall,
} from '../types/chat'
import type {
  ApprovalRequestPayload,
  ErrorPayload,
  HermesSessionInfo,
  MessageCompletePayload,
  MessageDeltaPayload,
  ReasoningDeltaPayload,
  StatusUpdatePayload,
  ToolCompletePayload,
  ToolStartPayload,
  HermesWireMessage,
} from '../services/hermes/types'

/**
 * Live chat state for every employee.
 *
 * Threads are keyed by profile name rather than session id, because the profile
 * is the stable identity: sessions are recreated on reconnect, and the server's
 * own `info.profile_name` cannot be trusted to say which employee a session
 * belongs to. Inbound events carry a session id, so they are translated back to
 * a profile through SessionManager before being applied.
 */

let messageSeq = 0
function nextId(prefix: string): string {
  messageSeq += 1
  return `${prefix}-${messageSeq}`
}

function emptyThread(profile: string): EmployeeThread {
  return { profile, messages: [], status: 'ready', hydrated: false }
}

function newMessage(role: MessageRole, text: string, idPrefix: string = role): ChatMessage {
  return {
    id: nextId(idPrefix),
    role,
    text,
    createdAt: Date.now(),
    thinkingBlocks: [],
    toolCalls: {},
    segments: text ? [{ type: 'text', id: nextId('seg'), text }] : [],
  }
}

interface ChatState {
  connection: ConnectionState
  connectionDetail?: string
  threads: Record<string, EmployeeThread>

  bind: (manager: SessionManager) => void
  setConnection: (state: ConnectionState, detail?: string) => void
  ensureThread: (profile: string) => void
  hydrate: (profile: string) => Promise<void>
  send: (profile: string, text: string) => Promise<void>
  stop: (profile: string) => Promise<void>
  clearApproval: (profile: string) => void
  applyEvent: (event: GatewayEvent) => void
}

/** Set outside the store so it is not part of rendered state. */
let sessions: SessionManager | null = null

export const useChatStore = create<ChatState>((set, get) => ({
  connection: 'idle',
  threads: {},

  bind: (manager) => {
    sessions = manager
  },

  setConnection: (connection, detail) => {
    // A dropped socket invalidates every session id; the next send recreates
    // them. Without this, sends after a reconnect address dead sessions.
    if (connection === 'reconnecting' || connection === 'closed') {
      sessions?.reset()
      set((state) => ({
        connection,
        connectionDetail: detail,
        threads: Object.fromEntries(
          Object.entries(state.threads).map(([key, thread]) => [
            key,
            thread.status === 'working'
              ? { ...thread, status: 'ready' as EmployeeStatus, workingSince: undefined }
              : thread,
          ]),
        ),
      }))
      return
    }
    set({ connection, connectionDetail: detail })
  },

  ensureThread: (profile) => {
    if (get().threads[profile]) return
    set((state) => ({ threads: { ...state.threads, [profile]: emptyThread(profile) } }))
  },

  hydrate: async (profile) => {
    get().ensureThread(profile)
    if (get().threads[profile]?.hydrated) return
    if (!sessions) return

    try {
      const result = await sessions.history(profile)
      const messages = toChatMessages(result.messages ?? [])
      set((state) => ({
        threads: {
          ...state.threads,
          [profile]: {
            ...(state.threads[profile] ?? emptyThread(profile)),
            messages,
            hydrated: true,
            error: undefined,
          },
        },
      }))
    } catch (err) {
      set((state) => ({
        threads: {
          ...state.threads,
          [profile]: {
            ...(state.threads[profile] ?? emptyThread(profile)),
            hydrated: true,
            error: (err as Error).message,
          },
        },
      }))
    }
  },

  send: async (profile, text) => {
    const trimmed = text.trim()
    if (!trimmed || !sessions) return

    get().ensureThread(profile)
    const userMessage = newMessage('user', trimmed)

    // Optimistic: the user's own words appear immediately. If the submit fails
    // the message stays and carries the error, rather than vanishing.
    set((state) => {
      const thread = state.threads[profile] ?? emptyThread(profile)
      return {
        threads: {
          ...state.threads,
          [profile]: {
            ...thread,
            messages: [...thread.messages, userMessage],
            status: 'working',
            workingSince: Date.now(),
            error: undefined,
          },
        },
      }
    })

    try {
      await sessions.submit(profile, trimmed)
    } catch (err) {
      set((state) => {
        const thread = state.threads[profile] ?? emptyThread(profile)
        return {
          threads: {
            ...state.threads,
            [profile]: {
              ...thread,
              status: 'error',
              workingSince: undefined,
              messages: thread.messages.map((m) =>
                m.id === userMessage.id ? { ...m, error: (err as Error).message } : m,
              ),
            },
          },
        }
      })
    }
  },

  stop: async (profile) => {
    if (!sessions) return
    try {
      await sessions.interrupt(profile)
    } finally {
      set((state) => {
        const thread = state.threads[profile]
        if (!thread) return state
        return {
          threads: {
            ...state.threads,
            [profile]: {
              ...thread,
              status: 'ready',
              workingSince: undefined,
              messages: reapRunningTools(thread.messages).map((m) =>
                m.streaming ? { ...m, streaming: false } : m,
              ),
            },
          },
        }
      })
    }
  },

  clearApproval: (profile) => {
    set((state) => {
      const thread = state.threads[profile]
      if (!thread) return state
      const next: EmployeeThread = { ...thread, approval: undefined }
      if (thread.status === 'needs-you') next.status = 'working'
      return { threads: { ...state.threads, [profile]: next } }
    })
  },

  applyEvent: (event) => {
    if (!event.sessionId || !sessions) return
    const profile = sessions.profileForSession(event.sessionId)
    if (!profile) return // An event for a session we do not own.

    set((state) => {
      const thread = state.threads[profile] ?? emptyThread(profile)
      const next = reduceEvent(thread, event)
      if (next === thread) return state
      return { threads: { ...state.threads, [profile]: next } }
    })
  },
}))

// ------------------------------------------------------------------ reducer

/** Pure so it can be tested against a recorded event sequence. */
export function reduceEvent(thread: EmployeeThread, event: GatewayEvent): EmployeeThread {
  const { type, payload } = event

  switch (type) {
    case 'message.start': {
      // Carries no payload at all, and can open a turn with no user prompt
      // behind it — the notification poller and the queued-prompt drain both
      // emit it.
      return {
        ...thread,
        status: 'working',
        workingSince: thread.workingSince ?? Date.now(),
        messages: [...thread.messages, { ...newMessage('employee', ''), streaming: true }],
      }
    }

    case 'message.delta': {
      const text = (payload as MessageDeltaPayload).text ?? ''
      if (!text) return thread
      return withCurrentMessage(thread, (message) => appendText(message, text))
    }

    case 'reasoning.delta': {
      // The real provider reasoning, token-streamed (Anthropic `thinking_delta`,
      // OpenAI `delta.reasoning_content`). Interleaved rather than a leading
      // phase: every tool-loop iteration has its own, so this legitimately
      // arrives *after* a `tool.complete`, and a turn has N blocks.
      const text = (payload as ReasoningDeltaPayload).text ?? ''
      if (!text) return thread
      return withCurrentMessage(thread, (message) => appendReasoning(message, text))
    }

    case 'thinking.delta':
      // Deliberately ignored. Despite the name this is not reasoning: it is the
      // kawaii spinner — "(⌐■_■) cogitating..." with the verb picked at random
      // per API call, interleaved with `{"text": ""}`. The shipped desktop
      // client drops it too. See THINKING-STATES-SCOPE.md.
      //
      // (The `⏳`/`⚠`-prefixed variants — "⏳ waiting on claude-opus-4.5 — 60s
      // with no output yet" — are a genuine stalled-provider hint and would be
      // worth splitting out if the UI ever wants one.)
      return thread

    case 'reasoning.available':
      // Deliberately ignored, and mislabelled upstream: the payload is the first
      // 500 chars of `assistant_message.content` — the *answer* — re-sent once
      // per tool-loop iteration. Accumulating it would duplicate the answer into
      // the reasoning pane. See THINKING-STATES-SCOPE.md.
      return thread

    case 'message.complete': {
      const complete = payload as MessageCompletePayload
      const index = lastStreamingIndex(thread.messages)
      const messages = [...thread.messages]
      const current = messages[index]
      if (current) {
        messages[index] = { ...settleText(current, complete.text), streaming: false }
      } else if (complete.text) {
        messages.push(newMessage('employee', complete.text))
      }
      return endTurn({ ...thread, messages })
    }

    case 'session.info': {
      // The only *guaranteed* turn terminal: emitted in the `finally` of every
      // turn, success or failure, whereas `message.complete` is skipped when the
      // turn dispatcher throws — which stranded the thread as permanently
      // `working`. Gated on `running`, because `session.create`,
      // `session.resume` and `config.set` all emit this same frame outside any
      // turn.
      const info = payload as HermesSessionInfo
      if (info.running !== false || thread.status !== 'working') return thread
      return endTurn({
        ...thread,
        messages: thread.messages.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
      })
    }

    case 'tool.start': {
      const tool = payload as ToolStartPayload
      if (!tool.tool_id) return thread
      const id = tool.tool_id
      return withCurrentMessage(thread, (message) =>
        upsertToolCall(message, {
          id,
          name: tool.name ?? 'tool',
          // `context` is a human label the backend already built ("Listing
          // skills"). Empty for every forge and MCP tool — they have no
          // `_TOOL_VERBS` entry — so the name has to remain the fallback.
          ...(tool.context ? { label: tool.context } : {}),
          status: 'running',
        }),
      )
    }

    case 'tool.complete': {
      const tool = payload as ToolCompletePayload
      if (!tool.tool_id) return thread
      const id = tool.tool_id
      // Can be the *first* sight of an id: the gateway suppresses `tool.start`
      // when tool progress is off, but still emits `tool.complete` when the
      // payload carries an inline diff. `upsertToolCall` therefore creates the
      // row and its spine segment rather than assuming one exists.
      return withCurrentMessage(thread, (message) =>
        upsertToolCall(message, { id, name: tool.name ?? 'tool', status: 'done' }),
      )
    }

    case 'status.update': {
      const status = payload as StatusUpdatePayload
      return { ...thread, statusText: status.text }
    }

    case 'approval.request': {
      const approval = payload as ApprovalRequestPayload
      const request: ApprovalRequest = {
        // Locally generated: the payload carries no id, because
        // `approval.respond` is keyed by session — at most one approval is
        // outstanding per session at a time.
        id: nextId('approval'),
        summary: approval.description || 'The agent needs your approval.',
        ...(approval.command ? { detail: approval.command } : {}),
      }
      return { ...thread, approval: request, status: 'needs-you' }
    }

    case 'error': {
      const error = payload as ErrorPayload
      const message = error.message ?? error.detail ?? 'The agent reported an error.'
      return {
        ...thread,
        status: 'error',
        workingSince: undefined,
        messages: reapRunningTools(thread.messages).map((m) =>
          m.streaming ? { ...m, streaming: false, error: message } : m,
        ),
      }
    }

    default:
      // Unhandled frame types are ignored on purpose: Hermes emits far more
      // event types than this UI models, and a new one must not break the
      // thread. Two of the unhandled ones are worth acting on eventually:
      // `notification.show` is the credits/quota channel, and the blocking
      // `clarify.request` / `secret.request` / `sudo.request` park the agent
      // thread for up to 300s waiting for a `*.respond` that never comes, so an
      // agent asking a clarifying question currently reads as a hang.
      return thread
  }
}

/** Settle the ready/needs-you side of a turn ending, whichever terminal fired. */
function endTurn(thread: EmployeeThread): EmployeeThread {
  return {
    ...thread,
    messages: reapRunningTools(thread.messages),
    status: thread.approval ? 'needs-you' : 'ready',
    workingSince: undefined,
    statusText: undefined,
  }
}

function lastStreamingIndex(messages: ChatMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.streaming) return i
  }
  return -1
}

/**
 * Apply an update to the open streaming message, opening one when there is
 * none: a text delta, a reasoning chunk or either tool frame can all be the
 * first thing we see when the socket joins a session that is already mid-turn.
 */
function withCurrentMessage(
  thread: EmployeeThread,
  update: (message: ChatMessage) => ChatMessage,
): EmployeeThread {
  const index = lastStreamingIndex(thread.messages)
  if (index === -1) {
    const opened = update({ ...newMessage('employee', ''), streaming: true })
    return { ...thread, status: 'working', messages: [...thread.messages, opened] }
  }
  const messages = [...thread.messages]
  const current = messages[index]
  if (!current) return thread
  messages[index] = update(current)
  return { ...thread, messages }
}

function appendText(message: ChatMessage, text: string): ChatMessage {
  const tail = message.segments[message.segments.length - 1]
  const segments = [...message.segments]
  if (tail?.type === 'text') {
    segments[segments.length - 1] = { ...tail, text: tail.text + text }
  } else {
    segments.push({ type: 'text', id: nextId('seg'), text })
  }
  return { ...message, text: message.text + text, segments }
}

/**
 * Continuation rule copied verbatim from imagine-computer-web: a reasoning
 * chunk extends the last block only while the spine's tail *is* that block.
 * Anything in between — answer text, a tool call — is a thought boundary, so the
 * next chunk opens a new block and a new segment. `trimStart` because a leading
 * space makes markdown render the whole block as a code fence.
 */
function appendReasoning(message: ChatMessage, text: string): ChatMessage {
  const tail = message.segments[message.segments.length - 1]
  if (tail?.type === 'thinking') {
    return {
      ...message,
      thinkingBlocks: message.thinkingBlocks.map((block) =>
        block.id === tail.blockId ? { ...block, text: block.text + text } : block,
      ),
    }
  }
  const trimmed = text.trimStart()
  if (!trimmed) return message
  const block: ThinkingBlock = { id: nextId('think'), text: trimmed }
  return {
    ...message,
    thinkingBlocks: [...message.thinkingBlocks, block],
    segments: [...message.segments, { type: 'thinking', id: nextId('seg'), blockId: block.id }],
  }
}

/**
 * Create or update a tool row, giving it a place on the spine the first time its
 * id is seen. A settled status is never downgraded back to `running`, so a
 * `tool.start` that arrives after its own `tool.complete` reorders nothing.
 */
function upsertToolCall(message: ChatMessage, call: ToolCall): ChatMessage {
  const existing = message.toolCalls[call.id]
  const merged: ToolCall = existing
    ? {
        ...existing,
        ...call,
        // `tool.complete` carries no `context`, so it must not blank the label.
        label: call.label ?? existing.label,
        status: existing.status === 'running' ? call.status : existing.status,
      }
    : call
  return {
    ...message,
    toolCalls: { ...message.toolCalls, [call.id]: merged },
    segments: existing
      ? message.segments
      : [...message.segments, { type: 'tool_call', id: nextId('seg'), toolCallId: call.id }],
  }
}

/**
 * A turn ended with tool rows still `running` — an interrupt mid-tool, or a
 * dispatcher throw that skipped their `tool.complete`. Left alone they spin
 * forever. `failed` is honest: all Hermes told us is that they never reported
 * back.
 */
function reapRunningTools(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    const running = Object.values(message.toolCalls).filter((c) => c.status === 'running')
    if (running.length === 0) return message
    const toolCalls = { ...message.toolCalls }
    for (const call of running) toolCalls[call.id] = { ...call, status: 'failed' }
    return { ...message, toolCalls }
  })
}

/**
 * `message.complete.text` is the authoritative whole answer — deltas can be
 * lossy if the socket blipped mid-turn. It replaces the flat text, but the text
 * *segments* can only be reconciled when there is exactly one of them: with
 * several, the delta ordering is the only record of where each ran relative to
 * the tool calls, and one flat string cannot rebuild it.
 */
function settleText(message: ChatMessage, final: string | undefined): ChatMessage {
  if (!final || final === message.text) return message
  const textSegments = message.segments.filter((segment) => segment.type === 'text')
  if (textSegments.length > 1) return { ...message, text: final }
  const only = textSegments[0]
  if (!only) {
    return {
      ...message,
      text: final,
      segments: [...message.segments, { type: 'text', id: nextId('seg'), text: final }],
    }
  }
  return {
    ...message,
    text: final,
    segments: message.segments.map((segment) =>
      segment.type === 'text' && segment.id === only.id ? { ...segment, text: final } : segment,
    ),
  }
}

// ------------------------------------------------------------ history replay

/**
 * Replay a persisted history into the same tree a live turn produces.
 *
 * Rows arrive flat and in order: `{ role: 'tool', name, context }` for each
 * call, then the assistant row carrying the visible text and its reasoning. Tool
 * rows are folded *forward* into the assistant message that follows them,
 * because the assistant turn that actually made the calls is dropped by the
 * backend serializer whenever it carried no text of its own.
 *
 * What history cannot carry — absent by necessity, not oversight. The raw data
 * is in SQLite's `tool_calls` column; `_history_to_messages` is what flattens
 * it, so richer replay is a backend change:
 *   - tool ids. Synthesized here, so they are *not* stable across reloads.
 *   - tool args, results, `duration_s`, `summary`, `inline_diff`, `todos`.
 *   - the reasoning of any tool-loop iteration whose assistant row had no text:
 *     dropped with that row. Only the block attached to a surviving row remains.
 *   - per-row timestamps. There are none, so `createdAt` is load time.
 */
export function toChatMessages(rows: HermesWireMessage[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  let pending: ToolCall[] = []

  const flush = () => {
    if (pending.length === 0) return
    messages.push(attachToolCalls(newMessage('employee', '', 'history'), pending))
    pending = []
  }

  for (const raw of rows) {
    if (raw.role === 'tool') {
      pending.push({
        id: nextId('history-tool'),
        name: typeof raw.name === 'string' && raw.name ? raw.name : 'tool',
        ...(typeof raw.context === 'string' && raw.context ? { label: raw.context } : {}),
        status: 'done',
      })
      continue
    }
    const message = toChatMessage(raw)
    if (!message) continue
    // Only an employee message can own the calls. Reaching a user row with some
    // still pending means the assistant row that made them was dropped whole.
    if (message.role !== 'employee') flush()
    messages.push(attachToolCalls(message, pending))
    pending = []
  }

  // A turn interrupted mid-tool ends with rows and no assistant row after them.
  flush()
  return messages
}

/** Translate one persisted Hermes message row into our display model. */
export function toChatMessage(raw: HermesWireMessage): ChatMessage | null {
  const role = typeof raw.role === 'string' ? raw.role : ''
  const text = extractText(raw)
  const reasoning = role === 'user' ? '' : extractReasoning(raw)
  // A reasoning-only assistant turn is deliberately preserved by the backend
  // rather than dropped as empty, so it must survive here too.
  if (!text && !reasoning) return null

  const message = newMessage(role === 'user' ? 'user' : 'employee', text, 'history')
  if (!reasoning) return message

  const block: ThinkingBlock = { id: nextId('think'), text: reasoning }
  return {
    ...message,
    thinkingBlocks: [block],
    // Ahead of the text: the surviving block is the one that ran immediately
    // before the answer.
    segments: [{ type: 'thinking', id: nextId('seg'), blockId: block.id }, ...message.segments],
  }
}

function attachToolCalls(message: ChatMessage, calls: ToolCall[]): ChatMessage {
  if (calls.length === 0) return message
  return {
    ...message,
    toolCalls: Object.fromEntries(calls.map((call) => [call.id, call])),
    segments: [
      ...calls.map((call) => ({
        type: 'tool_call' as const,
        id: nextId('seg'),
        toolCallId: call.id,
      })),
      ...message.segments,
    ],
  }
}

function extractText(raw: HermesWireMessage): string {
  if (typeof raw.text === 'string' && raw.text) return raw.text
  const content = raw.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          const value = (part as { text?: unknown }).text
          return typeof value === 'string' ? value : ''
        }
        return ''
      })
      .filter(Boolean)
      .join('')
  }
  return ''
}

/**
 * Reasoning *is* durable — `reasoning` / `reasoning_content` /
 * `reasoning_details` are dedicated columns, serialized verbatim with no
 * 500-char cap — so a past turn can render its thinking. Field order mirrors the
 * backend's own extractor. `codex_reasoning_items` is skipped on purpose: it is
 * an opaque provider round-trip blob, not display prose.
 */
function extractReasoning(raw: HermesWireMessage): string {
  const parts: string[] = []
  const add = (value: unknown) => {
    if (typeof value === 'string' && value.trim() && !parts.includes(value)) parts.push(value)
  }

  add(raw.reasoning)
  add(raw.reasoning_content)
  if (Array.isArray(raw.reasoning_details)) {
    for (const detail of raw.reasoning_details) {
      if (!detail || typeof detail !== 'object') continue
      const fields = detail as Record<string, unknown>
      add(fields.summary ?? fields.thinking ?? fields.content ?? fields.text)
    }
  }
  return parts.join('\n\n').trimStart()
}
