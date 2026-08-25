import type { ComponentType } from 'react'

export interface RosterSidebarProps {
  /** Profile name of the employee whose thread is open, if any. */
  activeProfile?: string
}

/**
 * One employee as the sidebar needs it: identity from `/api/profiles`, the
 * last-outcome line and stamp from the batched sidebar-sessions call.
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

export interface RosterNavItem {
  to: string
  label: string
  /** Icons take className only and inherit colour. */
  icon: ComponentType<{ className?: string }>
  /**
   * Match this path exactly. Set on Employees so an open thread lights up its
   * roster row alone rather than two rows at once.
   */
  end?: boolean
  badge?: string
}
