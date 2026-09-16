/**
 * One row of `GET /api/sessions?profile=…` (`HermesSessionRow`), narrowed to
 * what a session-list row actually draws.
 *
 * Deliberately carries nothing this app cannot back with a real Hermes field.
 * `unread` and `is_active` ARE real columns — an earlier note here said they
 * were not, and that was wrong; the row carries both, alongside `title`. What
 * is genuinely absent is any per-session approval state, so the canvas's
 * "Allow" and "Review" buttons have nothing behind them for a historical row:
 * `approval.pending` takes a LIVE session id, so a pending approval only
 * exists for a session that is running and blocked right now. Those two
 * affordances are therefore not modelled.
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
  /** `unread` — the design's dot. Hermes maintains it against `last_read_at`. */
  unread: boolean
  /** `is_active` — mid-turn right now, which is the design's "Working now". */
  isActive: boolean
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
