import type { ComponentType } from 'react'

export interface RosterSidebarProps {
  /**
   * Whether the collapse control shrinks the sidebar to its icon rail. False inside the
   * below-`desktop-sm` drawer, where the same control dismisses the drawer instead.
   */
  collapsible?: boolean
  /** Closes the drawer. Only used when `collapsible` is false. */
  onDismiss?: () => void
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

interface RosterNavItemBase {
  label: string
  /** Icons take className only and inherit colour. */
  icon: ComponentType<{ className?: string }>
  badge?: string
  /**
   * Opts the row into §4.1's live employee chip, which replaces `badge` while
   * anything is running or waiting. Only rows that ask for it subscribe to the
   * chat store, so the other nine pay nothing for it.
   */
  live?: boolean
}

/**
 * A nav row is either a destination or an action, and the two are peers rather
 * than one being a special case of the other: §4.2 is explicit that `Search` is
 * "a **button**, not a link" because it opens a modal over wherever you are.
 * `NavRow` narrows on `'to' in item`.
 */
export type RosterNavItem =
  | (RosterNavItemBase & {
      to: string
      /**
       * Match this path exactly. Set where a row would otherwise stay lit for
       * every nested route beneath it.
       */
      end?: boolean
    })
  | (RosterNavItemBase & { onSelect: () => void })
