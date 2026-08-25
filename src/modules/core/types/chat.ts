export type MessageRole = 'user' | 'employee' | 'system'

export interface ToolCall {
  id: string
  name: string
  status: 'running' | 'done'
  summary?: string
  durationSeconds?: number
}

export interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  createdAt: number
  /** True while deltas are still arriving for this message. */
  streaming?: boolean
  tools?: ToolCall[]
  /** Set when the turn failed; rendered inline rather than as a toast. */
  error?: string
  /** Local-only, e.g. "Renamed to Sales Outbound". Never sent to the agent. */
  system?: boolean
}

export interface ApprovalRequest {
  id: string
  tool?: string
  summary: string
  detail?: string
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
  /** Whether history has been loaded from the backend yet. */
  hydrated: boolean
  /** Wall-clock ms when the current turn started, for the elapsed timer. */
  workingSince?: number
  error?: string
}
