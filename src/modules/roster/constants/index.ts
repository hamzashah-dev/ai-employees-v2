import { ClockPendingIcon } from '@repo/icons/clock-pending-icon'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { KnowledgeIcon } from '@repo/icons/knowledge-icon'
import { MeetingCalendarIcon } from '@repo/icons/meeting-calendar-icon'
import { PeopleIcon } from '@repo/icons/people-icon'
import { SearchIcon } from '@repo/icons/search'
import { StartNewIcon } from '@repo/icons/start-new-icon'
import { TimeClockIcon } from '@repo/icons/time-clock-icon'
import { ToolBoxIcon } from '@repo/icons/tool-box'
import { ToolsIcon } from '@repo/icons/tools-icon'
import { WebsiteContentIcon } from '@repo/icons/website-content-icon'
import { SEARCH_SHORTCUT_LABEL } from '@/modules/core/constants/shortcuts'
import { useSearchStore } from '@/modules/core/stores/search-store'
import type { RosterNavItem } from '../types'

export const SKELETON_ROW_COUNT = 4

/**
 * Route slugs, matching imagine-computer-web's `ABSOLUTE_ROUTES` so the ported
 * nav reads the same. Only `/`, `/employees`, `/employees/hire/:agentKey`,
 * `/employees/:profile`, `/search`, `/routines`, `/groups` and `/settings` are
 * mounted in this app today — the remaining default-mode destinations are the
 * surrounding product's and resolve to the catch-all until `src/app` mounts them.
 *
 * There is no `/marketplace`. Browsing and hiring *is* the Employees page, so the
 * catalogue lives at `EMPLOYEES` and one agent's detail panel opens over it at
 * `HIRE/:agentKey`. `hire` is a fixed segment, so it can never be mistaken for a
 * profile slug by `EMPLOYEES/:profile`.
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
  HIRE: '/employees/hire',
  ROUTINES: '/routines',
  GROUPS: '/groups',
  SETTINGS: '/settings',
} as const

/**
 * Settings' Connectors tab, spelled out here rather than imported.
 *
 * `settingsTabPath('connectors')` would say the same thing, but it lives in `modules/
 * settings` and a feature module may not reach into another's internals. The tab id is
 * part of the route's public shape — it is in the URL — so restating it is honest;
 * `modules/settings` normalises anything it does not recognise back to Account.
 */
const CONNECTORS_PATH = `${ROUTES.SETTINGS}/connectors`

/**
 * Routes that put the sidebar in Employees mode. The Sites mechanism keys off a
 * single root; Employees owns three, so the predicate takes a list.
 *
 * `EMPLOYEES` covers the hire panel and every thread too, since the predicate
 * matches on the root.
 */
export const EMPLOYEES_ROUTE_ROOTS: string[] = [
  ROUTES.EMPLOYEES,
  ROUTES.SEARCH,
  ROUTES.ROUTINES,
  ROUTES.GROUPS,
]

/**
 * Routes that leave the mode alone rather than resetting it, so a hop out of
 * Employees to manage connectors or preferences keeps the Employees sidebar.
 *
 * The shipped Sites allow-list is `/customize` only; `/integrations` is added
 * here because the design names it explicitly ("a hop into /integrations keeps
 * the Employees sidebar"). One line to revert if the intent was literally
 * "copy Sites".
 *
 * `/settings` is sticky rather than an Employees root, and the two constants'
 * own wording is the argument: Employees roots *put* the sidebar in Employees
 * mode, and Settings must not — it is opened from the account row in the
 * footer, which is on screen in both modes, so a default-mode user pressing it
 * would come back to a sidebar they never asked for. Sticky is exactly the
 * documented case instead: "a hop out of Employees to manage connectors or
 * preferences keeps the Employees sidebar".
 */
export const MODE_STICKY_ROUTE_ROOTS: string[] = [
  ROUTES.CUSTOMIZE,
  ROUTES.INTEGRATIONS,
  ROUTES.SETTINGS,
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
  {
    to: ROUTES.EMPLOYEES,
    label: 'Employees',
    icon: PeopleIcon,
    end: true,
    badge: 'Beta',
    live: true,
  },
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
  {
    to: ROUTES.EMPLOYEES,
    label: 'Employees',
    icon: PeopleIcon,
    end: true,
    badge: 'Beta',
    live: true,
  },
  /*
   * §4.2: "a **button**, not a link". The modal opens over whatever is on screen, so
   * navigating away from it would be the wrong thing to do.
   *
   * The chord is printed rather than merely bound. `useEmployeeSearch` has listened for
   * Cmd/Ctrl+K since the modal was built, and nothing said so anywhere — a shortcut
   * nobody can discover is a shortcut nobody uses.
   */
  {
    label: 'Search',
    icon: SearchIcon,
    badge: SEARCH_SHORTCUT_LABEL,
    keyShortcut: 'Meta+K Control+K',
    onSelect: () => useSearchStore.getState().open(),
  },
  /*
   * Integrations goes to Settings › Connectors, which is the only place in this app that
   * lists the install's MCP servers. The badge is their count, live off the same
   * `['mcp-servers', 'current']` entry that page reads, so the two can never disagree.
   */
  {
    to: CONNECTORS_PATH,
    label: 'Integrations',
    icon: ConnectorsIcon,
    connectors: true,
  },
  // No Groups row: rooms are still routed, but the sidebar no longer points at them.
  // No Marketplace row either — `Employees` above *is* the marketplace now, and two rows
  // pointing at one page reads as two places.
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



/** The one workspace this build talks to — the Hermes install behind it. */
export const WORKSPACE_NAME = 'ImagineComputer'

/**
 * The Computer platform's logo, as a pure-CSS orb.
 *
 * Upstream this entry is a remote still — `getCDNUrl('images/imagine-computer/
 * computer-platform.png')` — resolved from `NEXT_PUBLIC_APP_CDN_URL` and
 * `NEXT_PUBLIC_CDN_BUCKET_PATH`. Those are Vercel-only (the monorepo keeps no `.env`, you pull
 * them with `pnpm vercel:envs`), and the file is not committed anywhere, so a standalone build
 * cannot resolve it.
 *
 * `PlatformSwitcherItem` already models this case: "exactly one of `imageSrc` /
 * `logoGradientClassName` is set per entry", the latter being "Tailwind classes painting the
 * entry logo as a pure-CSS gradient orb". So this uses the component's own supported second
 * path rather than a guessed URL or a network dependency. Swap it for the still once the app
 * lives in the monorepo and the env vars resolve.
 */
export const WORKSPACE_LOGO_GRADIENT =
  'bg-[radial-gradient(circle_at_32%_26%,#F6CDEA_0%,#DCC1F4_22%,#A9A5EE_44%,#5C7BE4_68%,#1F49C4_86%,#122E77_100%)]'
