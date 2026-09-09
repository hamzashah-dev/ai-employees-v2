/**
 * One row of `GET /api/sessions?profile=…` (`HermesSessionRow`), narrowed to
 * what a session-list row actually draws.
 *
 * Deliberately carries nothing this app cannot back with a real Hermes field.
 * The canvas's own s34 draws "Allow"/"Review" actions and a live "Working
 * now" badge on individual rows — `HermesSessionRow` has no approval-pending
 * flag and no per-session running state (only `chat-store`'s live, per-
 * *profile* status does, via the gateway socket), so neither is modelled
 * here. See `modules/sessions/index.tsx` for how the honest substitute reads.
 */
export interface SessionSummary {
  /** `resolved_id` when the row carries one, else `id` — the key a resume call wants. */
  id: string
  title: string
  preview: string
  /** Epoch ms, from `last_active` falling back to `started_at`. */
  activityMs: number
  timeLabel: string
  messageCount: number
}

/** A row grouped for the list — "Today", "This month", or an older bucket. */
export interface SessionGroup {
  label: string
  sessions: SessionSummary[]
}

/** One message in a session's transcript, narrowed from Hermes' loose wire shape. */
export interface SessionMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'other'
  text: string
}
