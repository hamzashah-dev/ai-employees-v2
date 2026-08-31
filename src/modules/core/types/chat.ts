import type { ClarifyRequest } from '../services/hermes/types'

export type MessageRole = 'user' | 'employee' | 'system'

/** One contiguous run of model reasoning. */
export interface ThinkingBlock {
  id: string
  text: string
}

/**
 * `failed` is only reachable through the orphan reaper: `tool.complete` carries
 * no success flag, so a tool that reported back is always `done`. One that never
 * reported by the time the turn ended is `failed` — that is all Hermes tells us.
 */
export type ToolCallStatus = 'running' | 'done' | 'failed'

export interface ToolCall {
  /** Hermes `tool_id` — the provider's tool-call id, stable across start and complete. */
  id: string
  /** Machine name, e.g. `skills_list`. */
  name: string
  /**
   * Hermes `tool.start.context` — a human label the backend already builds
   * ("Listing skills", "Reading skill deck-builder → SKILL.md"). Empty for forge/MCP tools.
   */
  label?: string
  status: ToolCallStatus
}

/**
 * The chronological spine. Holds *pointers* into `thinkingBlocks` / `toolCalls` so ordering
 * survives out-of-order status updates, and so a live stream and a replayed history produce
 * an identical tree from the same reducer.
 */
export type Segment =
  | { type: 'text'; id: string; text: string }
  | { type: 'thinking'; id: string; blockId: string }
  | { type: 'tool_call'; id: string; toolCallId: string }

export interface ChatMessage {
  id: string
  role: MessageRole
  /**
   * The whole answer prose, flat. Kept alongside the `text` segments rather
   * than derived from them: `message.complete` ships the authoritative full
   * text, and previews/scroll heuristics want one string, not a walk.
   */
  text: string
  createdAt: number
  /** True while deltas are still arriving for this message. */
  streaming?: boolean
  /** Reasoning prose. Interleaved: every tool-loop iteration has its own block. */
  thinkingBlocks: ThinkingBlock[]
  toolCalls: Record<string, ToolCall>
  segments: Segment[]
  /** Set when the turn failed; rendered inline rather than as a toast. */
  error?: string
  /** Local-only, e.g. "Renamed to Sales Outbound". Never sent to the agent. */
  system?: boolean
}

/**
 * `tool` used to live here and is gone: `approval.request` carries no tool name
 * (nor an id — see `ApprovalRequestPayload`), only the command and its
 * description, so nothing could ever populate it.
 */
export interface ApprovalRequest {
  /** Local. `approval.respond` is keyed by session, so there is no server id. */
  id: string
  summary: string
  detail?: string
}

/**
 * A `secret.request` after validation — a skill declared a required env var, the
 * env file does not have it, and the gateway has parked the whole agent thread
 * inside `_block()` until `secret.respond` arrives. That wait is passed no
 * timeout at all (`tui_gateway/server.py`), so it is even less expirable than a
 * clarify: `secret.expire` is the only end-of-wait signal there is.
 *
 * There is deliberately no `value` field, and one must never be added. What the
 * human types goes from the input straight into the `secret.respond` params —
 * Hermes writes it to the profile's env file itself at 0600 and omits it from
 * the tool result — so nothing in this app ever holds the secret.
 */
export interface SecretRequest {
  requestId: string
  /** The env var the skill declared, e.g. `LINEAR_API_KEY`. */
  envVar: string
  /** The sentence the skill wrote for the human, e.g. where to get the key. */
  prompt: string
  /** Whatever the skill attached — its own name, a docs URL. Free-form. */
  metadata?: Record<string, unknown>
}

/**
 * Hermes exposes no per-profile runtime status — the only status-like field on
 * a profile is a `gateway_running` boolean, which is about the messaging
 * gateway, not about whether the agent is mid-thought. These three states are
 * derived entirely from the socket we already hold, which is accurate for every
 * turn this UI started.
 */
export type EmployeeStatus = 'ready' | 'working' | 'needs-you' | 'error'

export interface EmployeeThread {
  profile: string
  messages: ChatMessage[]
  status: EmployeeStatus
  /** Free text from `status.update`, e.g. "Researching 14 prospects". */
  statusText?: string
  approval?: ApprovalRequest
  /**
   * The agent has asked the human a question and its whole thread is parked on
   * the answer (`clarify.respond`). No deadline is stored because there is no
   * honest one — see `ClarifyRequest`.
   */
  clarify?: ClarifyRequest
  /**
   * The agent hit a credential it does not have and its whole thread is parked
   * on `secret.respond`. Only the REQUEST lives here — never the value the human
   * types. See `SecretRequest`.
   */
  secret?: SecretRequest
  /**
   * noVNC page for the browser this employee is driving, once we have seen one.
   *
   * It arrives on a `browser_navigate` tool RESULT and nowhere else — there is
   * no browser-session event and nothing to poll — so it can only be known
   * after the agent's first navigation of the session, and it is sticky
   * afterwards: the same container serves the same page for the session's life.
   */
  liveUrl?: string
  /**
   * `session.info.tools`, grouped by toolset (`{ browser: ['browser_navigate'] }`).
   * Arrives on session create/resume rather than during a turn, and is how the
   * UI knows whether this employee has a given toolset at all.
   */
  toolsets?: Record<string, string[]>
  /** Whether history has been loaded from the backend yet. */
  hydrated: boolean
  /** Wall-clock ms when the current turn started, for the elapsed timer. */
  workingSince?: number
  error?: string
}
