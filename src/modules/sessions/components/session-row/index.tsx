import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { Spinner } from '@/modules/core/components/spinner'

interface SessionRowProps {
  title: string
  /** Relative time, or "Working now" while the session is mid-turn. */
  timeLabel: string
  unread: boolean
  isActive: boolean
  onOpen: () => void
}

/**
 * One session in the list.
 *
 * The canvas's per-row "Allow" and "Review" buttons are absent, and that is a
 * data problem rather than an oversight: approvals are readable only for a
 * live, blocked session (`approval.pending` takes a live session id), so a
 * historical row has no approval state to render. A button that cannot know
 * whether it has anything to approve is worse than no button — a user who
 * believes they approved a spend and did not is the failure this app is most
 * careful about.
 *
 * "Working now" and the unread dot ARE real: `is_active` and `unread` are
 * columns on the row.
 */
export const SessionRow: FC<SessionRowProps> = ({
  title,
  timeLabel,
  unread,
  isActive,
  onOpen,
}) => (
  <li>
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors duration-200 ease-linear hover:bg-fill-variant-hover"
    >
      <span className="flex items-center gap-2">
        <span
          className={cn('truncate text-label-lg text-primary', {
            'font-medium': unread,
          })}
        >
          {title}
        </span>
        {isActive && <Spinner className="size-3 shrink-0 text-tertiary" />}
        {unread && (
          <span
            // Announced rather than drawn only: the dot is the sole marker that
            // an agent has said something since you last looked.
            aria-label="Unread"
            role="img"
            className="size-1.5 shrink-0 rounded-full bg-fill-inverse"
          />
        )}
      </span>
      <span className="truncate text-label-sm text-tertiary">
        {isActive ? 'Working now' : timeLabel}
      </span>
    </button>
  </li>
)
