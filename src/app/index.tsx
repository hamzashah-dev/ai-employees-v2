import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react'
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
import { useIsLaptop } from '@/modules/core/hooks/media-query'
import { useHermesConnection } from '@/modules/core/hooks/use-hermes'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { isAgentBrowsing } from '@/modules/panel/hooks/use-browser-view'
import { ROUTES } from '@/modules/roster/constants'

/**
 * The thread is the view people land in from the roster, so it stays in the main bundle.
 * The panel and the catalogue are opened deliberately and carry the heavier dependencies
 * (markdown rendering, the catalog), so they load on demand.
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
const AgentDetailView = lazy(() =>
  import('@/modules/marketplace/usecases/agent-detail').then((m) => ({
    default: m.AgentDetailView,
  })),
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
  const isLaptop = useIsLaptop()

  /**
   * The drawer opens itself when the agent reaches for a browser.
   *
   * The signal is derived, not a new event: a `browser_*` call running on the
   * open turn, or a clarify question standing (the login ask — the moment the
   * drawer is the only place to answer). `liveUrl` would be later and rarer,
   * since it only ever rides on a `browser_navigate` result.
   *
   * It has to live here rather than in the drawer, because a closed drawer is
   * unmounted and cannot watch anything.
   */
  const needsPanel = useChatStore((state) => {
    const thread = state.threads[profile ?? '']
    return isAgentBrowsing(thread) || thread?.clarify != null
  })

  /**
   * Closing it means closed, for the rest of the turn.
   *
   * The latch cannot be re-armed off `needsPanel` going false: that boolean
   * tracks a browser call being *in flight*, so it drops to false in the gap
   * between every `tool.complete` and the next `tool.start`. Those are two
   * separate store commits with a render between them, so re-arming there
   * clears the latch several times a turn — and "find me clients on LinkedIn"
   * is dozens of browser calls, i.e. the drawer shoves itself back open dozens
   * of times against a user who closed it. That is the exact argument this
   * latch exists to let them win.
   *
   * The turn ending is the honest boundary, and `thread.status` already marks
   * it. `needs-you` is excluded deliberately: a standing clarify card is not
   * the turn being over, and re-arming on it would re-open the drawer the user
   * just closed.
   */
  const isTurnOver = useChatStore((state) => {
    const status = state.threads[profile ?? '']?.status ?? 'ready'
    return status !== 'working' && status !== 'needs-you'
  })

  const dismissed = useRef(false)

  useEffect(() => {
    if (isTurnOver) dismissed.current = false
    if (!needsPanel || dismissed.current) return
    // Below `laptop` the drawer is a full-screen sheet: opening it uninvited
    // would take the conversation off the screen mid-turn.
    if (isLaptop) setPanelOpen(true)
  }, [needsPanel, isTurnOver, isLaptop])

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
      {panelOpen && (
        <EmployeePanel
          profile={profile}
          onClose={() => {
            dismissed.current = true
            setPanelOpen(false)
          }}
        />
      )}
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
              {/*
                Employees *is* the catalogue. There is no separate marketplace page and no
                roster dashboard: the sidebar already lists the team, so a page that listed
                it again was the emptiest surface in the app, and the one thing you actually
                come here to do is hire.
              */}
              <Route
                path={ROUTES.EMPLOYEES}
                element={
                  <Page title="Employees" onOpenSidebar={openSidebar}>
                    <MarketplaceView />
                  </Page>
                }
              />
              {/*
                One agent's detail, over a dimmed catalogue — which is why both render here
                rather than the panel replacing the grid. `AgentDetailView` portals through
                `Dialog`, so the mount point does not affect where it paints.

                `hire` is a fixed segment, so this can never be shadowed by `:profile`
                below; React Router ranks a static segment above a dynamic one, and the two
                patterns differ in length anyway.
              */}
              <Route
                path={`${ROUTES.HIRE}/:agentKey`}
                element={
                  <Page title="Employees" onOpenSidebar={openSidebar}>
                    <MarketplaceView />
                    <AgentDetailView />
                  </Page>
                }
              />
              <Route
                path={`${ROUTES.EMPLOYEES}/:profile`}
                element={<EmployeeRoute onOpenSidebar={openSidebar} />}
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
