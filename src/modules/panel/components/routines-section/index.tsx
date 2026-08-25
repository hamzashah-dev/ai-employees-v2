import { useId, type FC } from 'react'
import { Button } from '@repo/ui/button'
import { Spinner } from '@/modules/core/components/spinner'
import { useRoutines } from '../../hooks/use-routines'
import { RoutineRow } from '../routine-row'
import { RoutineSkeleton } from '../routine-skeleton'

interface RoutinesSectionProps {
  profile: string
}

/**
 * Everything this employee runs without being asked.
 *
 * The 8px gap is the panel body's own rhythm, repeated inside so the heading
 * and every row sit on it — the canvas has no dividers or padding here.
 */
export const RoutinesSection: FC<RoutinesSectionProps> = ({ profile }) => {
  const headingId = useId()
  const { data, isPending, isError, error, refetch, isFetching } = useRoutines(profile)

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="text-label-md font-medium text-primary">
        Routines
      </h2>

      {isPending && (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((row) => (
            <RoutineSkeleton key={row} />
          ))}
        </ul>
      )}

      {isError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-primary px-3 py-3">
          <p className="min-w-0 flex-1 text-label-sm text-critical">
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
          <div className="rounded-xl border border-primary px-3 py-4">
            <p className="text-label-md text-primary">No routines yet</p>
            <p className="pt-1 text-label-sm text-tertiary">
              Routines are scheduled jobs this employee runs on its own.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.map((job) => (
              <RoutineRow key={job.id} job={job} profile={profile} />
            ))}
          </ul>
        ))}
    </section>
  )
}
