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
  'session.seeded',
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
  'error',
] as const

export type HermesEventType = (typeof HERMES_EVENTS)[number]

export interface MessageDeltaPayload {
  text?: string
}

export interface MessageCompletePayload {
  text?: string
  status?: string
  usage?: { input_tokens?: number; output_tokens?: number }
}

export interface ToolStartPayload {
  tool_id?: string
  name?: string
  args?: unknown
}

export interface ToolCompletePayload {
  tool_id?: string
  name?: string
  args?: unknown
  result?: unknown
  summary?: string
  duration_s?: number
}

export interface ApprovalRequestPayload {
  approval_id?: string
  tool?: string
  summary?: string
  detail?: string
}

export interface StatusUpdatePayload {
  text?: string
  status?: string
}

export interface ErrorPayload {
  message?: string
  detail?: string
}

// -------------------------------------------------------------- rpc shapes

export interface HermesSessionInfo {
  model?: string
  tools?: string[]
  skills?: string[]
  cwd?: string
  lazy?: boolean
  /**
   * Reports the *process-global* profile, never the one the session was
   * created with — it comes from `_current_profile_name()`, which reads
   * COMPUTER_HOME. It is always "default" here regardless of what you asked
   * for. Never use it to identify a session's employee; track that client-side.
   */
  profile_name?: string
}

export interface HermesWireMessage {
  role?: string
  content?: unknown
  text?: string
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
