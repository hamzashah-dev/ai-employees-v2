/**
 * One employee as a list needs it: identity from `/api/profiles`, the last-outcome
 * line and stamp from the batched sidebar-sessions call.
 *
 * In core because three surfaces draw the same row from the same two queries — the
 * sidebar's roster, the search modal's Recent list, and anything that follows them.
 * `use-roster` is the one place it is built.
 */
export interface RosterEntry {
  /** Hermes profile name — the row's identity and its route segment. */
  profile: string
  displayName: string
  /** Last outcome line. Never empty, so every row is the same height. */
  subtitle: string
  /** Already formatted for display; empty when the employee has no sessions. */
  timeLabel: string
  /** Machine-readable form of `timeLabel`, for `<time dateTime>`. */
  timeIso?: string
  /** Sort key. 0 when the employee has never run. */
  activityMs: number
}
