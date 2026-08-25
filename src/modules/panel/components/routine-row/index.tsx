import type { ComponentType, FC } from 'react'
import { Button } from '@/modules/core/components/button'
import { ClockIcon, PauseIcon, PlayIcon } from '@/modules/core/components/icon'
import { Spinner } from '@/modules/core/components/status-pill'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { cn } from '@/modules/core/utils/cn'
import { useRoutineActions } from '../../hooks/use-routine-actions'
import { formatSchedule } from '../../utils/format-schedule'
import { isRoutinePaused, routineLabel } from '../../utils/routine-state'

interface RoutineRowProps {
  job: HermesCronJob
  profile: string
}

/** One scheduled job, with the two things you ever want to do to it. */
export const RoutineRow: FC<RoutineRowProps> = ({ job, profile }) => {
  const { pause, resume, trigger, error } = useRoutineActions(job.id, profile)
  const paused = isRoutinePaused(job)
  const label = routineLabel(job)

  // Written as whole strings rather than through cn(): tailwind-merge reads the
  // custom `text-label-sm` role token as a text *colour*, so merging it with a
  // real colour drops the type scale and the line renders at body size.
  const scheduleClass = paused
    ? 'truncate text-label-sm text-[rgb(var(--color-ink-5))]'
    : 'truncate text-label-sm text-[rgb(var(--color-ink-7)/0.5)]'

  return (
    <li className="group flex items-start gap-3 rounded-[12px] px-3 py-2.5 hover:bg-[rgb(var(--color-ink-2))]">
      <ClockIcon
        className={cn(
          'mt-0.5 size-4 shrink-0',
          paused ? 'text-[rgb(var(--color-ink-5))]' : 'text-[rgb(var(--color-success))]',
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md font-medium text-[rgb(var(--color-ink-7))]">
          {label}
        </p>
        <p className={scheduleClass}>
          {paused ? 'Paused' : formatSchedule(job.schedule)}
        </p>
        {error && (
          <p role="status" className="text-label-sm text-[rgb(var(--color-danger))]">
            {error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {paused ? (
          <RowAction
            icon={PlayIcon}
            label={`Resume ${label}`}
            pending={resume.isPending}
            onClick={() => resume.mutate()}
          />
        ) : (
          <RowAction
            icon={PauseIcon}
            label={`Pause ${label}`}
            pending={pause.isPending}
            onClick={() => pause.mutate()}
          />
        )}
        <RowAction
          icon={PlayIcon}
          label={`Run ${label} now`}
          pending={trigger.isPending}
          onClick={() => trigger.mutate()}
        />
      </div>
    </li>
  )
}

interface RowActionProps {
  icon: ComponentType<{ className?: string }>
  label: string
  pending: boolean
  onClick: () => void
}

/**
 * A hover-revealed row action.
 *
 * Revealed by colour rather than `visibility`, which would drop the buttons out
 * of the tab order and strand keyboard users; `opacity` is not part of this
 * design. The button stays present and focusable at all times, and the pointer
 * is by definition inside the row before it can click one.
 */
const RowAction: FC<RowActionProps> = ({ icon: Icon, label, pending, onClick }) => (
  <Button
    variant="ghost"
    size="icon"
    aria-label={label}
    disabled={pending}
    onClick={onClick}
    className={cn(
      'hover:bg-[rgb(var(--color-ink-3))] focus-visible:text-[rgb(var(--color-ink-7))]',
      pending
        ? 'text-[rgb(var(--color-ink-6))]'
        : 'text-transparent group-hover:text-[rgb(var(--color-ink-6))] group-hover:hover:text-[rgb(var(--color-ink-7))]',
    )}
  >
    {pending ? <Spinner className="size-4" /> : <Icon />}
  </Button>
)
