import { lazy, Suspense, type FC } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs'
import {
  DEFAULT_SETTINGS_TAB,
  isSettingsTab,
  SETTINGS_TABS,
  settingsTabPath,
  type SettingsTabId,
} from './constants'

/**
 * The three sections load on demand, as the rest of the app's routes do — named
 * exports, so each lazy import maps `m.X` onto a default. Settings is reached from
 * a footer button that most sessions never press, and the Vault view carries the
 * whole credentials surface, so pulling all three into the main bundle to draw a
 * tab strip would be the wrong trade.
 */
const AccountView = lazy(() =>
  import('./usecases/account').then((m) => ({ default: m.AccountView })),
)
const VaultView = lazy(() =>
  import('./usecases/vault').then((m) => ({ default: m.VaultView })),
)
const ConnectorsView = lazy(() =>
  import('./usecases/connectors').then((m) => ({ default: m.ConnectorsView })),
)

/**
 * Screens 2a–2c — Settings, opened from the sidebar footer's Settings button.
 *
 * The active tab is the URL's `:tab` segment (see `constants`), so a tab is
 * linkable and survives a reload. `Tabs` therefore has no internal state to keep:
 * `value` is read off the route and `onValueChange` navigates, which is the same
 * shape the marketplace uses for its maker tabs.
 *
 * The `Tabs` root wraps the strip *and* the panel, with one `TabsContent` whose
 * value tracks the active tab, so the active trigger's `aria-controls` resolves to
 * the panel it actually controls. A bare `TabsList` would leave every trigger
 * pointing at an element that does not exist.
 *
 * `h1` is `sr-only` because the {@link TopBar} above already prints "Settings" —
 * as a `span`, so a page with no heading at all would be a real regression for a
 * screen reader. Same reasoning, same treatment as the marketplace page.
 */
export const SettingsView: FC = () => {
  const { tab } = useParams<{ tab: string }>()
  const navigate = useNavigate()

  /*
   * A typed or stale `/settings/whatever` is normalised rather than rendered.
   * Radix keys the panel off a matching trigger value, so handing it a value no
   * tab owns paints a strip with nothing active and no panel underneath — an
   * empty page that looks like a bug. A bare `/settings` is not that case: it is
   * the surface's own entry point and simply opens on Account.
   */
  if (tab !== undefined && !isSettingsTab(tab)) {
    return <Navigate to={settingsTabPath(DEFAULT_SETTINGS_TAB)} replace />
  }

  const active: SettingsTabId = isSettingsTab(tab) ? tab : DEFAULT_SETTINGS_TAB

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 pt-4">
        <h1 className="sr-only">Settings</h1>

        <Tabs
          value={active}
          onValueChange={(next) => {
            // Guarded rather than cast: Radix hands back a `string`, and this is the
            // same predicate the route segment goes through, so one answer covers both.
            if (isSettingsTab(next)) navigate(settingsTabPath(next))
          }}
          className="flex flex-col gap-6"
        >
          <TabsList
            aria-label="Settings sections"
            className="h-auto w-auto justify-start gap-1 px-0"
          >
            {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                variant="secondary"
                size="md"
                className="rounded-full border-transparent"
                startSlot={<Icon className="size-4" />}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={active} className="flex flex-col gap-4">
            <Suspense
              fallback={<p className="py-8 text-label-md text-tertiary">Loading…</p>}
            >
              {active === 'account' && <AccountView />}
              {active === 'vault' && <VaultView />}
              {active === 'connectors' && <ConnectorsView />}
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
