import type { ComponentType, FC } from 'react'
import { PauseIcon } from '@repo/icons/pause'
import { PencilIcon } from '@repo/icons/pencil'
import { PlayIcon } from '@repo/icons/play'
import { PlayCircleIcon } from '@repo/icons/play-circle'
import { TimeClockIcon } from '@repo/icons/time-clock-icon'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { Spinner } from '@/modules/core/components/spinner'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { useRoutineActions } from '../../hooks/use-routine-actions'
import { formatSchedule } from '@/modules/core/utils/format-schedule'
import { isRoutinePaused, routineLabel } from '../../utils/routine-state'

interface RoutineRowProps {
  job: HermesCronJob
  profile: string
  /** Opens the editor on this routine. */
  onEdit: () => void
}

/** One scheduled job, with the three things you ever want to do to it. */
export const RoutineRow: FC<RoutineRowProps> = ({ job, profile, onEdit }) => {
  const { pause, resume, trigger, error } = useRoutineActions(job.id, profile)
  const paused = isRoutinePaused(job)
  const label = routineLabel(job)
  // The canvas states the routine twice: a paused one reads "Paused" under a
  // pause glyph, a live one reads its schedule under a green clock.
  const StateIcon = paused ? PauseIcon : TimeClockIcon

  return (
    <li className="group flex items-start gap-2.5 px-1 py-2">
      <StateIcon
        className={cn('mt-0.5 size-4 shrink-0', {
          'text-tertiary': paused,
          'text-success': !paused,
        })}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md text-primary">{label}</p>
        <p className="truncate text-label-sm text-tertiary">
          {paused ? 'Paused' : formatSchedule(job.schedule)}
        </p>
        {error && (
          <p role="status" className="text-label-sm text-critical">
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
          icon={PlayCircleIcon}
          label={`Run ${label} now`}
          pending={trigger.isPending}
          onClick={() => trigger.mutate()}
        />
        {/* An action rather than a click target on the row itself: the row
            already holds buttons, and a button inside a button is not markup a
            browser will render. */}
        <RowAction
          icon={PencilIcon}
          label={`Edit ${label}`}
          pending={false}
          onClick={onEdit}
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
 * A hover-revealed row action. The canvas draws no controls on a routine row,
 * so they stay invisible until the pointer is in the row.
 *
 * Revealed by colour rather than `visibility`, which would drop the buttons out
 * of the tab order and strand keyboard users; `opacity` is not part of this
 * design. The button stays present and focusable at all times, and the pointer
 * is by definition inside the row before it can click one.
 */
const RowAction: FC<RowActionProps> = ({ icon: Icon, label, pending, onClick }) => (
  <Button
    variant="icon-ghost"
    size="icon-xs"
    shape="pill"
    aria-label={label}
    disabled={pending}
    onClick={onClick}
    className={cn('[&>svg]:size-4', {
      'text-secondary': pending,
      'text-transparent group-hover:text-secondary group-hover:hover:text-primary focus-visible:text-primary':
        !pending,
    })}
  >
    {pending ? <Spinner className="size-4" /> : <Icon />}
  </Button>
)
