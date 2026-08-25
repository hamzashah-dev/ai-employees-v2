import {
  ClockIcon,
  ComposeIcon,
  SearchIcon,
  StoreIcon,
  TeamIcon,
} from '@/modules/core/components/icon'
import type { RosterNavItem } from '../types'

/** How often the last-outcome lines refresh. */
export const SESSIONS_REFETCH_MS = 15_000

export const SKELETON_ROW_COUNT = 4

/**
 * The nav row shape, lifted verbatim from chatly-web's
 * `COMMON_SIDEBAR_MENU_CLASSES` (sidebar-body-content/constants/index.ts) so
 * rows here sit at exactly the product's height, radius and hover treatment.
 *
 *   flex h-10 cursor-pointer items-center justify-between gap-2
 *   rounded-xl px-3 py-2.5 transition-all duration-200 ease-linear
 *   hover:bg-fill-variant-hover
 */
export const SIDEBAR_ROW_CLASSES =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 ' +
  'transition-colors duration-200 ease-linear hover:bg-[rgb(var(--color-fill-variant-hover))]'

/** chatly's active row: `bg-fill-variant-active`. */
export const SIDEBAR_ROW_ACTIVE_CLASSES = 'bg-[rgb(var(--color-fill-variant-active))]'

/**
 * chatly's nav icons are 16px at stroke 1.2 — noticeably lighter than a default
 * 1.5, and a large part of why the product's sidebar reads as airy.
 */
export const SIDEBAR_ICON_CLASSES =
  'size-4 shrink-0 stroke-[1.2px] text-[rgb(var(--color-content-primary))]'

export const NAV_ITEMS: RosterNavItem[] = [
  { to: '/', label: 'New Chat', icon: ComposeIcon, end: true },
  { to: '/employees', label: 'Employees', icon: TeamIcon, end: true, badge: 'Beta' },
  { to: '/search', label: 'Search Chats', icon: SearchIcon },
  { to: '/marketplace', label: 'Marketplace', icon: StoreIcon, badge: 'Beta' },
]

export const ROUTINES_ITEM: RosterNavItem = {
  to: '/routines',
  label: 'Scheduled',
  icon: ClockIcon,
}

/**
 * Hermes exposes no user identity endpoint, so the footer is a constant. One
 * edit here when there is a real one.
 */
export const ACCOUNT_NAME = 'Imagine User'
export const ACCOUNT_PLAN = 'Pro Plan'
