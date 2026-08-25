import { create } from 'zustand'
import type { GatewayEvent, ConnectionState } from '../services/hermes/gateway'
import type { SessionManager } from '../services/hermes/session-manager'
import type {
  ApprovalRequest,
  ChatMessage,
  EmployeeStatus,
  EmployeeThread,
  ToolCall,
} from '../types/chat'
import type {
  ErrorPayload,
  MessageCompletePayload,
  MessageDeltaPayload,
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
      const messages = (result.messages ?? []).map(toChatMessage).filter(Boolean) as ChatMessage[]
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
    const userMessage: ChatMessage = {
      id: nextId('user'),
      role: 'user',
      text: trimmed,
      createdAt: Date.now(),
    }

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
              messages: thread.messages.map((m) =>
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
      return {
        ...thread,
        status: 'working',
        workingSince: thread.workingSince ?? Date.now(),
        messages: [
          ...thread.messages,
          {
            id: nextId('employee'),
            role: 'employee',
            text: '',
            createdAt: Date.now(),
            streaming: true,
          },
        ],
      }
    }

    case 'message.delta': {
      const text = (payload as MessageDeltaPayload).text ?? ''
      if (!text) return thread
      const index = lastStreamingIndex(thread.messages)
      if (index === -1) {
        // A delta with no open message — the socket joined mid-turn. Open one
        // rather than dropping the text.
        return {
          ...thread,
          status: 'working',
          messages: [
            ...thread.messages,
            {
              id: nextId('employee'),
              role: 'employee',
              text,
              createdAt: Date.now(),
              streaming: true,
            },
          ],
        }
      }
      const messages = [...thread.messages]
      const current = messages[index]
      if (!current) return thread
      messages[index] = { ...current, text: current.text + text }
      return { ...thread, messages }
    }

    case 'message.complete': {
      const complete = payload as MessageCompletePayload
      const index = lastStreamingIndex(thread.messages)
      const messages = [...thread.messages]
      if (index !== -1) {
        const current = messages[index]
        if (current) {
          messages[index] = {
            ...current,
            // Prefer the server's final text: deltas can be lossy if the socket
            // blipped mid-turn, and `message.complete` always carries the whole
            // message.
            text: complete.text ?? current.text,
            streaming: false,
          }
        }
      } else if (complete.text) {
        messages.push({
          id: nextId('employee'),
          role: 'employee',
          text: complete.text,
          createdAt: Date.now(),
        })
      }
      return {
        ...thread,
        messages,
        status: thread.approval ? 'needs-you' : 'ready',
        workingSince: undefined,
        statusText: undefined,
      }
    }

    case 'tool.start': {
      const tool = payload as ToolStartPayload
      if (!tool.tool_id) return thread
      const call: ToolCall = {
        id: tool.tool_id,
        name: tool.name ?? 'tool',
        status: 'running',
      }
      return withCurrentMessage(thread, (message) => ({
        ...message,
        tools: [...(message.tools ?? []), call],
      }))
    }

    case 'tool.complete': {
      const tool = payload as ToolCompletePayload
      if (!tool.tool_id) return thread
      return withCurrentMessage(thread, (message) => ({
        ...message,
        tools: (message.tools ?? []).map((t) =>
          t.id === tool.tool_id
            ? {
                ...t,
                status: 'done' as const,
                summary: tool.summary,
                durationSeconds: tool.duration_s,
              }
            : t,
        ),
      }))
    }

    case 'status.update': {
      const status = payload as StatusUpdatePayload
      return { ...thread, statusText: status.text ?? status.status }
    }

    case 'approval.request': {
      const approval = payload as { approval_id?: string; tool?: string; summary?: string; detail?: string }
      const request: ApprovalRequest = {
        id: approval.approval_id ?? nextId('approval'),
        tool: approval.tool,
        summary: approval.summary ?? `${approval.tool ?? 'The agent'} needs your approval.`,
        detail: approval.detail,
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
        messages: thread.messages.map((m) =>
          m.streaming ? { ...m, streaming: false, error: message } : m,
        ),
      }
    }

    default:
      // Unhandled frame types are ignored on purpose: Hermes emits more event
      // types than this UI models, and a new one must not break the thread.
      return thread
  }
}

function lastStreamingIndex(messages: ChatMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.streaming) return i
  }
  return -1
}

function withCurrentMessage(
  thread: EmployeeThread,
  update: (message: ChatMessage) => ChatMessage,
): EmployeeThread {
  const index = lastStreamingIndex(thread.messages)
  if (index === -1) return thread
  const messages = [...thread.messages]
  const current = messages[index]
  if (!current) return thread
  messages[index] = update(current)
  return { ...thread, messages }
}

/** Translate a persisted Hermes message row into our display model. */
export function toChatMessage(raw: HermesWireMessage): ChatMessage | null {
  const role = typeof raw.role === 'string' ? raw.role : ''
  const text = extractText(raw)
  if (!text) return null

  return {
    id: nextId('history'),
    role: role === 'user' ? 'user' : 'employee',
    text,
    createdAt: Date.now(),
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
