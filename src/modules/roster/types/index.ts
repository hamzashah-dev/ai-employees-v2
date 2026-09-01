import type { ComponentType } from 'react'

/** Promoted to core once the search modal drew the same rows. */
export type { RosterEntry } from '@/modules/core/types/roster'

export interface RosterSidebarProps {
  /**
   * Whether the collapse control shrinks the sidebar to its icon rail. False inside the
   * below-`desktop-sm` drawer, where the same control dismisses the drawer instead.
   */
  collapsible?: boolean
  /** Closes the drawer. Only used when `collapsible` is false. */
  onDismiss?: () => void
}


interface RosterNavItemBase {
  label: string
  /** Icons take className only and inherit colour. */
  icon: ComponentType<{ className?: string }>
  badge?: string
  /**
   * The chord that also triggers this row, in ARIA's own notation (`Meta+K`).
   *
   * Separate from the `badge` that prints it, and that split is the point: the printed
   * form is decoration, so it is hidden from assistive tech and the row keeps `Search` as
   * its accessible name, while `aria-keyshortcuts` is the attribute screen readers
   * actually announce shortcuts from.
   */
  keyShortcut?: string
  /**
   * Opts the row into §4.1's live employee chip, which replaces `badge` while
   * anything is running or waiting. Only rows that ask for it subscribe to the
   * chat store, so the other nine pay nothing for it.
   */
  live?: boolean
  /**
   * Opts the row into the connector count, which replaces `badge` once the MCP
   * listing answers. Same reasoning as `live`: only the row that asks for it holds
   * the query, so no other row pays for a request it does not draw.
   */
  connectors?: boolean
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
