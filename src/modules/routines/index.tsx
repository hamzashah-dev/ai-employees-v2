import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { Skeleton } from '@repo/ui/skeleton'
import { Spinner } from '@/modules/core/components/spinner'
import { RoutinesTable } from './components/routines-table'
import { SKELETON_ROW_COUNT } from './constants'
import { useAllRoutines } from './hooks/use-all-routines'

/**
 * Every routine on the roster, in one table.
 *
 * The whole page is fed by a single `GET /api/cron/jobs?profile=all`, which
 * fans out server-side — so this costs one request no matter how many employees
 * are hired.
 */
export const RoutinesView: FC = () => {
  const { data, isPending, isError, error, refetch, isFetching } = useAllRoutines()

  return (
    <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-6 pb-10">
      <div className="mx-auto w-full max-w-[1040px]">
        <p className="pb-4 pt-2 text-label-md text-tertiary">
          Everything your employees run without being asked.
        </p>

        {isPending && <LoadingTable />}

        {isError && (
          <div className="flex items-center gap-3 rounded-2xl border border-primary px-4 py-4">
            <p className="min-w-0 flex-1 text-label-md text-critical">
              {error?.message || 'Couldn’t load routines.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching && <Spinner />}
              Retry
            </Button>
          </div>
        )}

        {data &&
          (data.length === 0 ? (
            <div className="rounded-2xl border border-primary px-4 py-6">
              <h2 className="text-label-lg text-primary">No routines yet</h2>
              <p className="pt-1 text-label-md text-tertiary">
                A routine is a scheduled job an employee runs on its own. Open an
                employee’s thread, show its screen, and add one from the Routines list.
              </p>
            </div>
          ) : (
            <RoutinesTable jobs={data} />
          ))}
      </div>
    </div>
  )
}

/** Header row plus five 56px rows, so the table does not jump when it lands. */
const LoadingTable: FC = () => (
  <div
    role="status"
    aria-label="Loading routines"
    className="overflow-hidden rounded-2xl border border-primary"
  >
    <div className="h-10 border-b border-primary" />
    {Array.from({ length: SKELETON_ROW_COUNT }, (_, row) => (
      <div
        key={row}
        className="flex h-14 items-center gap-3 border-b border-primary px-4 last:border-b-0"
      >
        <Skeleton className="size-7 shrink-0 rounded-full bg-fill-elevated" />
        <Skeleton className="h-3 w-32 bg-fill-elevated" />
        <Skeleton className="h-3 w-40 bg-fill-elevated" />
        <Skeleton className="ml-auto h-5 w-16 rounded-lg bg-fill-elevated" />
      </div>
    ))}
  </div>
)
