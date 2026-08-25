import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useState, type FC } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'

import { Providers } from './providers'
import { ConnectionBanner } from './components/connection-banner'
import { useHermesConnection } from '@/modules/core/hooks/use-hermes'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'
import { RosterSidebar } from '@/modules/roster'

/**
 * The thread is the landing view, so it stays in the main bundle. The panel and
 * the marketplace are opened deliberately and carry the heaviest dependencies
 * (markdown rendering, the catalog), so they load on demand.
 */
const ThreadView = lazy(() =>
  import('@/modules/thread').then((m) => ({ default: m.ThreadView })),
)
const EmployeePanel = lazy(() =>
  import('@/modules/panel').then((m) => ({ default: m.EmployeePanel })),
)
const MarketplaceView = lazy(() =>
  import('@/modules/marketplace').then((m) => ({ default: m.MarketplaceView })),
)

const LAST_EMPLOYEE_KEY = 'employees:last-profile'

function readLastEmployee(): string | null {
  try {
    return localStorage.getItem(LAST_EMPLOYEE_KEY)
  } catch {
    return null
  }
}

function writeLastEmployee(profile: string): void {
  try {
    localStorage.setItem(LAST_EMPLOYEE_KEY, profile)
  } catch {
    // Private browsing or disabled storage — losing the preference is fine.
  }
}

/**
 * `/employees` has no landing page of its own by design, so it resolves to the
 * employee you were last talking to, falling back to the first in the roster.
 */
const EmployeesIndex: FC = () => {
  const { data: profiles, isPending, isError, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

  if (isPending) return <CentredNote>Loading your team…</CentredNote>

  if (isError) {
    return (
      <CentredNote tone="danger">
        Could not reach Hermes. {(error as Error).message}
      </CentredNote>
    )
  }

  const names = profiles.map((p) => p.name)
  if (names.length === 0) {
    return (
      <CentredNote>
        No employees yet. Hire one from the Marketplace to get started.
      </CentredNote>
    )
  }

  const last = readLastEmployee()
  const target = last && names.includes(last) ? last : names[0]
  return <Navigate to={`/employees/${encodeURIComponent(target ?? '')}`} replace />
}

const EmployeeRoute: FC = () => {
  const { profile } = useParams<{ profile: string }>()
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    if (profile) writeLastEmployee(profile)
  }, [profile])

  if (!profile) return <Navigate to="/employees" replace />

  return (
    <div className="flex min-h-0 flex-1">
      <ThreadView
        key={profile}
        profile={profile}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((open) => !open)}
      />
      {panelOpen && <EmployeePanel profile={profile} onClose={() => setPanelOpen(false)} />}
    </div>
  )
}

const Shell: FC = () => {
  useHermesConnection()

  return (
    <div className="flex h-screen flex-col bg-primary">
      <ConnectionBanner />
      <div className="flex min-h-0 flex-1">
        <RosterSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<CentredNote>Loading…</CentredNote>}>
            <Routes>
              <Route path="/" element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<EmployeesIndex />} />
              <Route path="/employees/:profile" element={<EmployeeRoute />} />
              <Route path="/marketplace" element={<MarketplaceView />} />
              {/*
                The canvas's D1 nav carries Search and Routines. Neither is in
                this build, and a link that silently redirects reads as a bug —
                so they resolve to a page that says so.
              */}
              <Route
                path="/search"
                element={
                  <NotBuiltYet
                    title="Search"
                    detail="Searching across every employee's threads is designed but not built yet. Hermes exposes /api/sessions/search, so it is a small addition."
                  />
                }
              />
              <Route
                path="/routines"
                element={
                  <NotBuiltYet
                    title="Routines"
                    detail="A combined view of every employee's routines is not built yet. Each employee's own routines are in their panel — open a thread and use the screen button."
                  />
                }
              />
              <Route path="*" element={<Navigate to="/employees" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

const NotBuiltYet: FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="flex flex-1 items-center justify-center p-8">
    <div className="max-w-[420px] text-center">
      <h1 className="text-heading-sm text-primary">{title}</h1>
      <p className="mt-2 text-label-md text-tertiary">{detail}</p>
    </div>
  </div>
)

const CentredNote: FC<{ children: React.ReactNode; tone?: 'danger' }> = ({
  children,
  tone,
}) => (
  <div className="flex flex-1 items-center justify-center p-8">
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
