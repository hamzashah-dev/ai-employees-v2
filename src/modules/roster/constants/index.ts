import { ClockPendingIcon } from '@repo/icons/clock-pending-icon'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { KnowledgeIcon } from '@repo/icons/knowledge-icon'
import { MeetingCalendarIcon } from '@repo/icons/meeting-calendar-icon'
import { PeopleIcon } from '@repo/icons/people-icon'
import { SearchIcon } from '@repo/icons/search'
import { ShoppingIcon } from '@repo/icons/shopping-icon'
import { StartNewIcon } from '@repo/icons/start-new-icon'
import { TimeClockIcon } from '@repo/icons/time-clock-icon'
import { ToolBoxIcon } from '@repo/icons/tool-box'
import { ToolsIcon } from '@repo/icons/tools-icon'
import { WebsiteContentIcon } from '@repo/icons/website-content-icon'
import type { RosterNavItem } from '../types'

/** How often the last-outcome lines refresh. */
export const SESSIONS_REFETCH_MS = 15_000

export const SKELETON_ROW_COUNT = 4

/**
 * Route slugs, matching imagine-computer-web's `ABSOLUTE_ROUTES` so the ported
 * nav reads the same. Only `/`, `/employees`, `/employees/:profile`, `/search`,
 * `/marketplace` and `/routines` are mounted in this app today — the remaining
 * default-mode destinations are the surrounding product's and resolve to the
 * catch-all until `src/app` mounts them.
 */
export const ROUTES = {
  NEW_CHAT: '/',
  SEARCH_CHATS: '/history',
  SITES: '/sites',
  EMPLOYEES: '/employees',
  AI_TOOLS: '/all-tools',
  CUSTOMIZE: '/customize',
  INTEGRATIONS: '/integrations',
  KNOWLEDGE: '/knowledge',
  SCHEDULED: '/dispatch',
  MEETINGS: '/meetings',
  SEARCH: '/search',
  MARKETPLACE: '/marketplace',
  ROUTINES: '/routines',
} as const

/**
 * Routes that put the sidebar in Employees mode. The Sites mechanism keys off a
 * single root; Employees owns four, so the predicate takes a list.
 */
export const EMPLOYEES_ROUTE_ROOTS: string[] = [
  ROUTES.EMPLOYEES,
  ROUTES.MARKETPLACE,
  ROUTES.SEARCH,
  ROUTES.ROUTINES,
]

/**
 * Routes that leave the mode alone rather than resetting it, so a hop out of
 * Employees to manage connectors or preferences keeps the Employees sidebar.
 *
 * The shipped Sites allow-list is `/customize` only; `/integrations` is added
 * here because the design names it explicitly ("a hop into /integrations keeps
 * the Employees sidebar"). One line to revert if the intent was literally
 * "copy Sites".
 */
export const MODE_STICKY_ROUTE_ROOTS: string[] = [
  ROUTES.CUSTOMIZE,
  ROUTES.INTEGRATIONS,
]

/**
 * The shared nav row box, verbatim from imagine-computer-web's
 * `COMMON_SIDEBAR_MENU_CLASSES`. The canvas only draws the 40px desktop state,
 * so the `tablet:` step-down comes from the shipped code, not from the design.
 */
export const SIDEBAR_ROW_CLASSES =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-all duration-200 ease-linear hover:bg-fill-variant-hover tablet:h-8 tablet:px-2 tablet:py-1.5'

/** Default-mode nav (D1) — Employees is a peer of Sites, above AI Tools. */
export const DEFAULT_NAV_ITEMS: RosterNavItem[] = [
  { to: ROUTES.NEW_CHAT, label: 'New Chat', icon: StartNewIcon, end: true },
  { to: ROUTES.SEARCH_CHATS, label: 'Search Chats', icon: SearchIcon, end: true },
  { to: ROUTES.SITES, label: 'Sites', icon: WebsiteContentIcon, badge: 'Beta' },
  { to: ROUTES.EMPLOYEES, label: 'Employees', icon: PeopleIcon, end: true, badge: 'Beta' },
  { to: ROUTES.AI_TOOLS, label: 'AI Tools', icon: ToolsIcon, end: true },
  { to: ROUTES.CUSTOMIZE, label: 'Customize', icon: ToolBoxIcon },
  { to: ROUTES.INTEGRATIONS, label: 'Integrations', icon: ConnectorsIcon },
  { to: ROUTES.KNOWLEDGE, label: 'Knowledge', icon: KnowledgeIcon },
  { to: ROUTES.SCHEDULED, label: 'Scheduled', icon: ClockPendingIcon, badge: 'Beta' },
  { to: ROUTES.MEETINGS, label: 'Meetings', icon: MeetingCalendarIcon },
]

/** Employees-mode nav (D3/D6/D11/D15). */
export const EMPLOYEES_NAV_ITEMS: RosterNavItem[] = [
  { to: ROUTES.NEW_CHAT, label: 'New Chat', icon: StartNewIcon, end: true },
  { to: ROUTES.EMPLOYEES, label: 'Employees', icon: PeopleIcon, end: true, badge: 'Beta' },
  { to: ROUTES.SEARCH, label: 'Search', icon: SearchIcon, end: true },
  { to: ROUTES.MARKETPLACE, label: 'Marketplace', icon: ShoppingIcon },
]

/** Pinned under the roster: routines belong to the team, not to one employee. */
export const ROUTINES_ITEM: RosterNavItem = {
  to: ROUTES.ROUTINES,
  label: 'Routines',
  icon: TimeClockIcon,
}

/**
 * Projects and History belong to the surrounding product's chat feature, not to
 * Hermes — there is no endpoint behind either, and none of these routes are
 * mounted in this app. The canvas's own sample rows are carried verbatim so the
 * default-mode sidebar renders at its designed density; they become a query the
 * day the chat feature lands here. Deliberately not faked as an API call.
 */
export const PROJECT_ROWS: string[] = ['Q3 launch', 'Website refresh']

export const HISTORY_ROWS: string[] = [
  'Draft reply to Vercel invoice',
  'Compare CRM options',
  'Lisbon offsite agenda',
  'Summarize churn survey',
]

/**
 * Hermes exposes no user identity or billing endpoint, so the footer is a
 * constant. One edit here when there is a real one.
 */
export const ACCOUNT_NAME = 'Imagine User'
export const ACCOUNT_PLAN = 'Pro Plan'

/** The one workspace this build talks to — the Hermes install behind it. */
export const WORKSPACE_NAME = 'ImagineComputer'
