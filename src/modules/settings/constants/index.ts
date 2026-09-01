import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { LockIcon } from '@repo/icons/lock-icon'
import { UserAccountIcon } from '@repo/icons/user-account-icon'
import { ROUTES } from '@/modules/roster/constants'

/**
 * The three Settings sections, in the design's order.
 *
 * Each tab is its own URL — `/settings/vault`, not `?tab=vault` — because that is
 * how this app already does sub-navigation: `/employees/hire/:agentKey` opens one
 * agent over the catalogue and `/groups/:roomId` opens one room, and there is not a
 * single `useSearchParams` in `src/`. A search param here would be the app's only
 * one, and a tab you can link, reload and bookmark is the whole point.
 *
 * `ROUTES` lives in `modules/roster` rather than in core, which is a boundary
 * wrinkle every other feature module already has (`marketplace`, `groups` and
 * `routines` all import it from there). It is the app's shared nav vocabulary and
 * belongs in `modules/core/constants/routes`; that promotion is one move for all
 * five importers, not something to fork here.
 */
export const SETTINGS_TABS = [
  { id: 'account', label: 'Account', icon: UserAccountIcon },
  { id: 'vault', label: 'Vault', icon: LockIcon },
  { id: 'connectors', label: 'Connectors', icon: ConnectorsIcon },
] as const satisfies readonly {
  id: string
  label: string
  icon: FC<PropsWithClassName>
}[]

export type SettingsTabId = (typeof SETTINGS_TABS)[number]['id']

/** Where a bare `/settings` lands, and where an unknown tab segment is sent. */
export const DEFAULT_SETTINGS_TAB: SettingsTabId = 'account'

export const settingsTabPath = (tab: SettingsTabId): string => `${ROUTES.SETTINGS}/${tab}`

export const isSettingsTab = (value: string | undefined): value is SettingsTabId =>
  SETTINGS_TABS.some((tab) => tab.id === value)
