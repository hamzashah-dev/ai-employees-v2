import { lazy, Suspense, useState, type FC, type ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'

import { Providers } from './providers'
import { AppSidebar } from './components/app-sidebar'
import { ConnectionBanner } from './components/connection-banner'
import { TopBar } from './components/top-bar'
import { useHermesConnection } from '@/modules/core/hooks/use-hermes'
import { ROUTES } from '@/modules/roster/constants'

/**
 * The thread is the view people land in from the roster, so it stays in the main bundle.
 * The panel, marketplace and dashboard are opened deliberately and carry the heavier
 * dependencies (markdown rendering, the catalog), so they load on demand.
 */
const ThreadView = lazy(() =>
  import('@/modules/thread').then((m) => ({ default: m.ThreadView })),
)
const ChatHomeView = lazy(() =>
  import('@/modules/thread/usecases/chat-home').then((m) => ({ default: m.ChatHomeView })),
)
const EmployeePanel = lazy(() =>
  import('@/modules/panel').then((m) => ({ default: m.EmployeePanel })),
)
const MarketplaceView = lazy(() =>
  import('@/modules/marketplace').then((m) => ({ default: m.MarketplaceView })),
)
const DashboardView = lazy(() =>
  import('@/modules/dashboard').then((m) => ({ default: m.DashboardView })),
)

interface PageProps {
  onOpenSidebar: () => void
}

/**
 * One employee's thread, with the panel as a flex sibling rather than an overlay.
 *
 * The panel measures its own `parentElement` to clamp a drag, so it has to stay a direct
 * child of this row — wrapping it would break the resize maths.
 *
 * This page draws no {@link TopBar}: the thread has its own header carrying the employee's
 * avatar, name and the panel toggle.
 */
const EmployeeRoute: FC<PageProps> = ({ onOpenSidebar }) => {
  const { profile } = useParams<{ profile: string }>()
  const [panelOpen, setPanelOpen] = useState(false)

  if (!profile) return <Navigate to={ROUTES.EMPLOYEES} replace />

  return (
    <div className="flex min-h-0 flex-1">
      <ThreadView
        key={profile}
        profile={profile}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((open) => !open)}
        onOpenSidebar={onOpenSidebar}
      />
      {panelOpen && <EmployeePanel profile={profile} onClose={() => setPanelOpen(false)} />}
    </div>
  )
}

/** A titled page: top bar, then the module's own content region. */
const Page: FC<{ title?: string; onOpenSidebar: () => void; children: ReactNode }> = ({
  title,
  onOpenSidebar,
  children,
}) => (
  <>
    <TopBar title={title} onOpenSidebar={onOpenSidebar} />
    {children}
  </>
)

const Shell: FC = () => {
  useHermesConnection()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar = (): void => setSidebarOpen(true)

  return (
    <div className="flex h-screen flex-col bg-primary">
      <ConnectionBanner />
      <div className="flex min-h-0 flex-1">
        <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<CentredNote>Loading…</CentredNote>}>
            <Routes>
              {/*
                `/` is the one mounted route outside an Employees root, so it is where the
                default-mode sidebar can actually be seen. Everything else keeps the
                Employees sidebar, which is the whole point of the mode swap.
              */}
              <Route
                path={ROUTES.NEW_CHAT}
                element={
                  <Page onOpenSidebar={openSidebar}>
                    <ChatHomeView />
                  </Page>
                }
              />
              <Route
                path={ROUTES.EMPLOYEES}
                element={
                  <Page title="Employees" onOpenSidebar={openSidebar}>
                    <DashboardView />
                  </Page>
                }
              />
              <Route
                path={`${ROUTES.EMPLOYEES}/:profile`}
                element={<EmployeeRoute onOpenSidebar={openSidebar} />}
              />
              <Route
                path={ROUTES.MARKETPLACE}
                element={
                  <Page title="Marketplace" onOpenSidebar={openSidebar}>
                    <MarketplaceView />
                  </Page>
                }
              />

              {/*
                The rest of the canvas's nav. Some are this app's own, unbuilt surfaces;
                the others belong to the surrounding product and arrive with the port.
                Either way they are mounted rather than left to the catch-all — a nav row
                that silently redirects reads as a bug, and `/customize` and `/integrations`
                have to exist for the sidebar's mode stickiness to be exercisable at all.
              */}
              {UNBUILT_ROUTES.map(({ path, title, detail }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <Page title={title} onOpenSidebar={openSidebar}>
                      <NotBuiltYet title={title} detail={detail} />
                    </Page>
                  }
                />
              ))}

              <Route path="*" element={<Navigate to={ROUTES.NEW_CHAT} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

/**
 * Destinations the canvas's nav points at that this build does not serve.
 *
 * Each says which it is — designed-but-unbuilt here, or owned by the surrounding product —
 * because "not built" and "not this app's job" are different answers to the same click.
 */
const UNBUILT_ROUTES: { path: string; title: string; detail: string }[] = [
  {
    path: ROUTES.SEARCH,
    title: 'Search',
    detail:
      'Searching across every employee’s threads is designed but not built yet. Hermes exposes /api/sessions/search, so it is a small addition.',
  },
  {
    path: ROUTES.ROUTINES,
    title: 'Routines',
    detail:
      'A combined view of every employee’s routines is not built yet. Each employee’s own routines are in their panel — open a thread and use the screen button.',
  },
  {
    path: ROUTES.SEARCH_CHATS,
    title: 'Search Chats',
    detail: 'Chat history belongs to the surrounding product and arrives with the port.',
  },
  {
    path: ROUTES.SITES,
    title: 'Sites',
    detail:
      'Sites is the surrounding product’s web builder. Its sidebar-mode mechanism is the one this app’s Employees mode mirrors.',
  },
  {
    path: ROUTES.AI_TOOLS,
    title: 'AI Tools',
    detail: 'The tools catalogue belongs to the surrounding product and arrives with the port.',
  },
  {
    path: ROUTES.CUSTOMIZE,
    title: 'Customize',
    detail:
      'Customisation belongs to the surrounding product. It is mounted here because the Employees sidebar deliberately survives a hop onto it.',
  },
  {
    path: ROUTES.INTEGRATIONS,
    title: 'Integrations',
    detail:
      'Connectors belong to the surrounding product. Mounted here because the Employees sidebar deliberately survives a hop onto it.',
  },
  {
    path: ROUTES.KNOWLEDGE,
    title: 'Knowledge',
    detail: 'The knowledge base belongs to the surrounding product and arrives with the port.',
  },
  {
    path: ROUTES.SCHEDULED,
    title: 'Scheduled',
    detail: 'Dispatch belongs to the surrounding product and arrives with the port.',
  },
  {
    path: ROUTES.MEETINGS,
    title: 'Meetings',
    detail: 'Meetings belong to the surrounding product and arrives with the port.',
  },
]

const NotBuiltYet: FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="flex min-h-0 flex-1 items-center justify-center p-8">
    <div className="max-w-[420px] text-center">
      <h1 className="text-heading-xs font-medium text-primary">{title}</h1>
      <p className="mt-2 text-label-md text-tertiary">{detail}</p>
    </div>
  </div>
)

const CentredNote: FC<{ children: ReactNode; tone?: 'danger' }> = ({ children, tone }) => (
  <div className="flex min-h-0 flex-1 items-center justify-center p-8">
    <p
      className={
        tone === 'danger'
          ? 'text-label-md text-critical'
          : 'text-label-md text-tertiary'
      }
    >
      {children}
    </p>
  </div>
)

export const App: FC = () => (
  <Providers>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </Providers>
)
