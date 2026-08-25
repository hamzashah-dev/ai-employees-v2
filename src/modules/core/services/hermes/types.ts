/**
 * Wire types for the Hermes dashboard.
 *
 * Two surfaces, deliberately kept apart:
 *   - REST  (`/api/*`)   — roster, sessions, cron. Must be same-origin.
 *   - Socket (`/api/ws`) — JSON-RPC 2.0. The only way to run an agent turn.
 *
 * Hand-written rather than generated: the dashboard ships no OpenAPI schema for
 * the socket, and these shapes were read off `tui_gateway/server.py` directly.
 */

// ---------------------------------------------------------------- JSON-RPC

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0'
  id: number
  result?: T
  error?: JsonRpcError
}

/**
 * Server-pushed frame. Note it reuses `method: 'event'` rather than a
 * notification per type, so `params.type` is the real discriminant.
 */
export interface JsonRpcEventFrame {
  jsonrpc: '2.0'
  method: 'event'
  params: {
    type: string
    /** Absent on connection-scoped events such as `gateway.ready`. */
    session_id?: string
    payload?: Record<string, unknown>
  }
}

export type JsonRpcFrame = JsonRpcResponse | JsonRpcEventFrame

export function isEventFrame(frame: JsonRpcFrame): frame is JsonRpcEventFrame {
  return (frame as JsonRpcEventFrame).method === 'event'
}

// ------------------------------------------------------------ event types

/**
 * The event vocabulary we actually handle. The server emits more; anything
 * unlisted is ignored rather than treated as an error, so a Hermes upgrade
 * that adds a frame type cannot break the client.
 */
export const HERMES_EVENTS = [
  'gateway.ready',
  'session.info',
  'session.title',
  'message.start',
  'message.delta',
  'message.interim',
  'message.complete',
  'reasoning.delta',
  'reasoning.available',
  'thinking.delta',
  'tool.start',
  'tool.generating',
  'tool.complete',
  'status.update',
  'approval.request',
  'background.complete',
  'notification.show',
  'notification.clear',
  // Blocking requests. The gateway's `_block()` helper emits one of these and
  // then *parks the whole agent thread* until the matching `<name>.respond` RPC
  // arrives or the wait expires — 300s for clarify/secret, 120s for sudo, 30s
  // for terminal.read. Nothing answers them today, so an agent asking a
  // clarifying question reads as a hang. On expiry the gateway emits the
  // `.expire` twin so a late responder gets a clean signal instead of a raw
  // JSON-RPC "no pending request" error.
  'clarify.request',
  'clarify.expire',
  'secret.request',
  'secret.expire',
  'sudo.request',
  'sudo.expire',
  'terminal.read.request',
  'terminal.read.expire',
  'error',
] as const

export type HermesEventType = (typeof HERMES_EVENTS)[number]

export interface MessageDeltaPayload {
  text?: string
}

export interface MessageCompletePayload {
  text?: string
  /** `complete` · `interrupted` · `error`. */
  status?: string
  /** Cumulative session totals, not per-turn. Built by `_get_usage`. */
  usage?: {
    model?: string
    input?: number
    output?: number
    reasoning?: number
    total?: number
    calls?: number
  }
  /** `result.last_reasoning` — the final reasoning block, already streamed via `reasoning.delta`. */
  reasoning?: string
  /** e.g. history desynced mid-turn and the answer was not persisted. */
  warning?: string
}

export interface ToolStartPayload {
  tool_id?: string
  name?: string
  /**
   * Human label built server-side by `agent/display.py:build_tool_label`
   * ("Listing skills"). Empty string for tools with no `_TOOL_VERBS` entry —
   * every `forge_tool` and every MCP/plugin tool.
   */
  context?: string
  /** Verbose sessions only. There is no `args` on `tool.start`; it is complete-only. */
  args_text?: string
}

export interface ToolCompletePayload {
  tool_id?: string
  name?: string
  args?: unknown
  result?: unknown
  summary?: string
  /** Absent when no matching `tool.start` was recorded for this id. */
  duration_s?: number
  /** `todo` only — the authoritative full list, unlike the partial merge on start. */
  todos?: unknown[]
  /**
   * A rendered edit diff. Load-bearing: its presence makes the gateway emit
   * `tool.complete` even when tool progress is off, i.e. with no `tool.start`.
   */
  inline_diff?: string
  /** Verbose sessions only. */
  result_text?: string
}

/**
 * Built from `tools/approval.py`'s `approval_data` — command/description, not
 * an id. There is no `approval_id`: `approval.respond` is keyed by session
 * (`{session_id, choice, all}`), so at most one approval is outstanding per
 * session at a time.
 */
export interface ApprovalRequestPayload {
  command?: string
  description?: string
  pattern_key?: string
  pattern_keys?: string[]
  allow_permanent?: boolean
  allow_session?: boolean
  smart_denied?: boolean
  /** Derived server-side, e.g. `['once', 'session', 'always', 'deny']`. */
  choices?: string[]
}

export interface StatusUpdatePayload {
  /** `status` · `process` · `lifecycle` · `compacting`. */
  kind?: string
  text?: string
}

/** Real provider reasoning, token-streamed. The one to accumulate. */
export interface ReasoningDeltaPayload {
  text?: string
  verbose?: boolean
}

/**
 * Despite the name, the first 500 chars of the *answer* — `_on_tool_progress`
 * forwards `assistant_message.content`, not reasoning. Fires once per tool-loop
 * iteration. See THINKING-STATES-SCOPE.md; do not render it as reasoning.
 */
export type ReasoningAvailablePayload = ReasoningDeltaPayload

/** The kawaii spinner — `"(⌐■_■) cogitating..."`. Not reasoning. */
export interface ThinkingDeltaPayload {
  text?: string
}

/** The model is still typing the arguments: no `tool_id` exists yet. */
export interface ToolGeneratingPayload {
  name?: string
}

export interface MessageInterimPayload {
  text?: string
  already_streamed?: boolean
}

/** The credits/quota channel. `key` is the handle `notification.clear` cancels. */
export interface NotificationShowPayload {
  text?: string
  level?: string
  kind?: string
  ttl_ms?: number
  key?: string
  id?: string
}

export interface NotificationClearPayload {
  key?: string
}

/** `request_id` is what the matching `<name>.respond` RPC must echo back. */
export interface ClarifyRequestPayload {
  request_id?: string
  question?: string
  choices?: string[]
}

export interface SecretRequestPayload {
  request_id?: string
  prompt?: string
  env_var?: string
  metadata?: Record<string, unknown>
}

/** `sudo.request` carries nothing but the id, as does every `.expire`. */
export interface BlockingRequestExpirePayload {
  request_id?: string
}

export interface ErrorPayload {
  message?: string
  detail?: string
}

// -------------------------------------------------------------- rpc shapes

/**
 * Doubles as the `session.info` *event* payload — the RPC result and the event
 * are both `_session_info()`. That event fires in the `finally` of every turn,
 * which is why `running` is the reliable busy signal.
 */
export interface HermesSessionInfo {
  model?: string
  provider?: string
  /** Grouped by toolset, e.g. `{ web: ['web_search'] }` — not a flat list. */
  tools?: Record<string, string[]>
  skills?: Record<string, string[]>
  cwd?: string
  lazy?: boolean
  /** True while a turn is in flight on this session. */
  running?: boolean
  /**
   * `""` = provider default, `"none"` = reasoning off, otherwise a level. Lets
   * the UI decide whether to offer a reasoning affordance before any tokens
   * arrive. Note `display.show_reasoning` is a client hint only — the gateway
   * streams `reasoning.delta` regardless of it.
   */
  reasoning_effort?: string
  /**
   * Reports the *process-global* profile, never the one the session was
   * created with — it comes from `_current_profile_name()`, which reads
   * COMPUTER_HOME. It is always "default" here regardless of what you asked
   * for. Never use it to identify a session's employee; track that client-side.
   */
  profile_name?: string
}

/**
 * A row as `_history_to_messages` serializes it. Two shapes share the type:
 *   - `user` / `assistant` / `system`: `{ role, text }` plus, on assistant rows,
 *     the reasoning columns below — persisted in full, no 500-char cap.
 *   - `tool`: `{ role: 'tool', name, context }` and nothing else. `tool_id`,
 *     `args`, `result`, `duration_s`, `summary` and `inline_diff` all exist in
 *     SQLite's `tool_calls` column but are dropped by the serializer, so richer
 *     replay is a backend change, not a client one.
 */
export interface HermesWireMessage {
  role?: string
  content?: unknown
  text?: string
  /** Plain string. */
  reasoning?: unknown
  /** Plain string; alternative provider field name. */
  reasoning_content?: unknown
  /** OpenRouter unified: `[{ type, summary | thinking | content | text }]`. */
  reasoning_details?: unknown
  /** Tool rows only: the machine name. */
  name?: string
  /** Tool rows only: the same `build_tool_label` string live `tool.start` carries. */
  context?: string
  [key: string]: unknown
}

export interface SessionCreateResult {
  session_id: string
  stored_session_id?: string
  message_count?: number
  messages?: HermesWireMessage[]
  info?: HermesSessionInfo
}

export interface SessionResumeResult extends SessionCreateResult {
  resumed?: boolean
  running?: boolean
  status?: string
}

export interface PromptSubmitResult {
  status: string
}

export interface FileAttachResult {
  attached?: boolean
  name?: string
  ref_path?: string
  /** Embed verbatim in the next `prompt.submit` text, e.g. "@file:abc123". */
  ref_text?: string
}

export interface SessionHistoryResult {
  count?: number
  messages?: HermesWireMessage[]
}

// ------------------------------------------------------------- REST shapes

export interface HermesProfile {
  name: string
  path: string
  is_default: boolean
  model: string | null
  provider: string | null
  has_env: boolean
  skill_count: number
  gateway_running: boolean
  description: string
  description_auto?: boolean
}

export interface HermesProfilesResponse {
  profiles: HermesProfile[]
}

/**
 * A row as Hermes actually returns it (~48 columns straight off `state.db`);
 * only the fields this app reads are declared.
 *
 * Note the recency field is `last_active`, epoch **seconds** as a float. There
 * is no `updated_at` or `last_message_at` — an earlier guess at those names
 * silently fell back to `started_at`, so every roster row showed when a
 * conversation began rather than when it last moved.
 */
export interface HermesSessionRow {
  id?: string
  title?: string | null
  preview?: string | null
  started_at?: string | number | null
  ended_at?: string | number | null
  last_active?: string | number | null
  message_count?: number
  source?: string | null
  /** The profile that owns this session. Injected by the cross-profile routes. */
  profile?: string | null
  profile_name?: string | null
  model?: string | null
  is_active?: boolean
  archived?: boolean | number
}

export interface HermesSessionsResponse {
  sessions: HermesSessionRow[]
  total?: number
}

export interface HermesProfileSessionsResponse {
  sessions: HermesSessionRow[]
  total?: number
  profile_totals?: Record<string, number>
  errors?: unknown
}

export interface HermesCronJob {
  id: string
  name?: string
  schedule?: string
  enabled?: boolean
  paused?: boolean
  next_run?: string | null
  last_run?: string | null
  prompt?: string
}

export interface HermesCronJobsResponse {
  jobs?: HermesCronJob[]
}

export interface HermesStatus {
  computer_home?: string
  version?: string
  gateway_running?: boolean
  overall?: string
}
