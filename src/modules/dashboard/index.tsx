import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { Skeleton } from '@repo/ui/skeleton'
import { ACCOUNT_NAME } from '@/modules/core/constants/account'
import { FinishedToday } from './components/finished-today'
import { NeedsYes } from './components/needs-yes'
import { WorkingNow } from './components/working-now'
import { YourTeam } from './components/your-team'
import { useDashboard } from './hooks/use-dashboard'

/**
 * D3 — the Employees dashboard.
 *
 * Five stacked sections, each of which collapses entirely when it has nothing
 * in it: a heading over an empty space reads as a fault. On a quiet morning the
 * screen is a greeting and the team grid, which is the honest picture.
 *
 * The greeting's name is the shared `ACCOUNT_NAME` — the same constant the sidebar
 * footer and the top bar read. Hermes exposes no user-identity endpoint, so there
 * is one placeholder for the whole app rather than a second one here.
 */
export const DashboardView: FC = () => {
  const { greeting, summary, sections, isLoading, errorMessage, retry } = useDashboard()

  return (
    // The canvas clips (`overflow:hidden`) because its artboard is 1600×1040 and
    // its content happens to fit. Real rosters do not, so the inner column
    // scrolls — otherwise the team grid is unreachable.
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pt-5">
      <div className="scrollbar-minimal mx-auto flex min-h-0 w-full max-w-[1200px] flex-col gap-5 overflow-y-auto pb-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-heading-lg font-medium text-primary">
            {greeting}, {ACCOUNT_NAME}
          </h1>
          {isLoading ? (
            <Skeleton className="mt-1 h-4 w-[280px] bg-fill-elevated" />
          ) : (
            <p className="text-body-md text-secondary">{summary}</p>
          )}
        </header>

        {errorMessage && (
          <div className="flex items-center gap-4 rounded-2xl border border-primary bg-fill-elevated p-4">
            <p className="min-w-0 flex-1 text-body-sm text-critical">{errorMessage}</p>
            <Button variant="outline" size="sm" className="shrink-0" onClick={retry}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <TeamSkeleton />
        ) : (
          <>
            <NeedsYes items={sections.needsYes} />
            <WorkingNow items={sections.working} />
            <FinishedToday items={sections.finished} />
            <YourTeam items={sections.team} />
          </>
        )}
      </div>
    </div>
  )
}

/** The team grid's own shape, so the page does not jump when it arrives. */
const TeamSkeleton: FC = () => (
  <div className="flex flex-col gap-2.5">
    <Skeleton className="h-5 w-24 bg-fill-elevated" />
    <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
      {[0, 1, 2].map((card) => (
        <Skeleton key={card} className="h-[68px] rounded-2xl bg-fill-elevated" />
      ))}
    </div>
  </div>
)
