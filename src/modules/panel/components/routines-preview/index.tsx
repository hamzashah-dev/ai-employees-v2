import { useId, useState, type FC } from 'react'
import { ArrowUpRightIcon } from '@repo/icons/arrow-up-right'
import { PauseIcon } from '@repo/icons/pause'
import { TimeClockIcon } from '@repo/icons/time-clock-icon'
import { cn } from '@repo/ui/cn'
import { Skeleton } from '@repo/ui/skeleton'
import { formatSchedule } from '@/modules/core/utils/format-schedule'
import { useRoutines } from '../../hooks/use-routines'
import { isRoutinePaused, routineLabel } from '../../utils/routine-state'
import { RoutinesDialog } from '../routines-dialog'

interface RoutinesPreviewProps {
  profile: string
  displayName: string
}

/** How many routines the panel states before it hands off to Manage. */
const VISIBLE_ROUTINES = 3

/**
 * What this employee runs without being asked, stated once.
 *
 * Read-only, like everything else in the panel below the model picker. The pause, run-now
 * and edit controls that used to hang off each row live behind "Manage" now — they were
 * hover-revealed buttons on a surface that is open beside every conversation, which put
 * three destructive-ish actions one stray click from a routine nobody was looking at.
 */
export const RoutinesPreview: FC<RoutinesPreviewProps> = ({ profile, displayName }) => {
  const headingId = useId()
  const [open, setOpen] = useState(false)
  const { data, isPending, isError, error } = useRoutines(profile)

  const shown = data?.slice(0, VISIBLE_ROUTINES) ?? []

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id={headingId} className="text-label-md font-medium text-primary">
          Routines
        </h2>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-1.5 py-0.5 text-label-sm text-secondary transition-colors duration-200 ease-linear hover:bg-fill-variant-hover hover:text-primary focus-visible:bg-fill-variant-hover focus-visible:outline-none"
        >
          Manage
          <ArrowUpRightIcon className="size-3" />
        </button>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3 py-1">
          {[0, 1].map((row) => (
            <Skeleton key={row} className="h-8 w-full bg-fill-elevated" />
          ))}
        </div>
      )}

      {isError && (
        <p role="alert" className="text-label-sm text-critical">
          {error?.message || 'Couldn’t load routines.'}
        </p>
      )}

      {data &&
        (shown.length === 0 ? (
          <p className="text-label-sm text-tertiary">
            None yet. Routines are jobs this employee runs on its own.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.map((job) => {
              const paused = isRoutinePaused(job)
              const StateIcon = paused ? PauseIcon : TimeClockIcon
              return (
                <li key={job.id} className="flex items-start gap-2.5 px-1 py-1">
                  <StateIcon
                    className={cn('mt-0.5 size-4 shrink-0', {
                      'text-tertiary': paused,
                      'text-success': !paused,
                    })}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md text-primary">
                      {routineLabel(job)}
                    </p>
                    <p className="truncate text-label-sm text-tertiary">
                      {paused ? 'Paused' : formatSchedule(job.schedule)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ))}

      {open && (
        <RoutinesDialog
          profile={profile}
          displayName={displayName}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </section>
  )
}
