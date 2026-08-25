import { useId, type FC } from 'react'
import { Button } from '@/modules/core/components/button'
import { Spinner } from '@/modules/core/components/status-pill'
import { useRoutines } from '../../hooks/use-routines'
import { RoutineRow } from '../routine-row'
import { RoutineSkeleton } from '../routine-skeleton'

interface RoutinesSectionProps {
  profile: string
}

/** Everything this employee runs without being asked. */
export const RoutinesSection: FC<RoutinesSectionProps> = ({ profile }) => {
  const headingId = useId()
  const { data, isPending, isError, error, refetch, isFetching } = useRoutines(profile)

  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-[rgb(var(--color-ink-2))] px-1 py-4"
    >
      <h2
        id={headingId}
        className="px-3 pb-2 text-label-md font-medium text-[rgb(var(--color-ink-7))]"
      >
        Routines
      </h2>

      {isPending && (
        <ul>
          {[0, 1, 2].map((row) => (
            <RoutineSkeleton key={row} />
          ))}
        </ul>
      )}

      {isError && (
        <div className="mx-2 flex items-center gap-3 rounded-[12px] border border-[rgb(var(--color-ink-2))] px-3 py-3">
          <p className="min-w-0 flex-1 text-label-sm text-[rgb(var(--color-danger))]">
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
          <div className="mx-2 rounded-[12px] border border-[rgb(var(--color-ink-2))] px-3 py-4">
            <p className="text-label-md text-[rgb(var(--color-ink-7))]">No routines yet</p>
            <p className="pt-1 text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">
              Routines are scheduled jobs this employee runs on its own.
            </p>
          </div>
        ) : (
          <ul>
            {data.map((job) => (
              <RoutineRow key={job.id} job={job} profile={profile} />
            ))}
          </ul>
        ))}
    </section>
  )
}
