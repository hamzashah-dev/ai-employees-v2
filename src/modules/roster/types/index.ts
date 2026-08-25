import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'

export interface RosterSidebarProps {
  /**
   * Collapses the sidebar. Owned by the app shell rather than here, because the
   * shell also owns the main column's offset and the below-`desktop-sm` drawer.
   * Until it is wired the brand row's toggle renders disabled.
   */
  onToggleCollapse?: () => void
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
  /** Icons take className only and inherit colour through `currentColor`. */
  icon: FC<PropsWithClassName>
  /**
   * Match this path exactly. Set on Employees so an open thread lights up its
   * roster row alone rather than two rows at once — which is what the design
   * draws on D6.
   */
  end?: boolean
  badge?: string
}
