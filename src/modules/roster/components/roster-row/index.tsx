import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { WarningIcon } from '@/modules/core/components/icon'
import { Spinner } from '@/modules/core/components/status-pill'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { cn } from '@/modules/core/utils/cn'
import { SIDEBAR_ROW_ACTIVE_CLASSES, SIDEBAR_ROW_CLASSES } from '../../constants'
import type { RosterEntry } from '../../types'

/**
 * One employee in the roster.
 *
 * Takes chatly's row treatment — rounded-xl, px-3, the same `fill-variant`
 * hover and active fills — but keeps the canvas's two-line shape. chatly's own
 * rows are single-line because they list chat *titles*; these list what an
 * employee last did ("8 filed, 1 with your note"), which is the point of the
 * roster and worth the extra line.
 *
 * Live status wins the right-hand slot over the timestamp: a spinner says more
 * than "6:04 PM" does.
 */
export const RosterRow: FC<{ entry: RosterEntry }> = ({ entry }) => {
  const status = useChatStore((s) => s.threads[entry.profile]?.status)
  const needsUser = status === 'needs-you' || status === 'error'

  return (
    <li>
      <NavLink
        to={`/employees/${encodeURIComponent(entry.profile)}`}
        className={({ isActive }) =>
          cn(
            SIDEBAR_ROW_CLASSES,
            'h-auto items-start py-2',
            isActive && SIDEBAR_ROW_ACTIVE_CLASSES,
          )
        }
      >
        <span className="flex min-w-0 items-start gap-2">
          <EmployeeAvatar profile={entry.profile} size={20} className="mt-0.5" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-label-md text-[rgb(var(--color-content-primary))]">
              {entry.displayName}
            </span>
            <span className="truncate text-label-sm text-[rgb(var(--color-content-primary)/0.5)]">
              {entry.subtitle}
            </span>
          </span>
        </span>

        <span className="mt-0.5 flex shrink-0 items-center">
          {status === 'working' ? (
            <Spinner
              className="text-[rgb(var(--color-content-primary)/0.5)]"
              aria-label={`${entry.displayName} is working`}
            />
          ) : needsUser ? (
            <WarningIcon
              className="size-4 stroke-[1.2px] text-[rgb(var(--color-danger))]"
              aria-label={`${entry.displayName} needs you`}
            />
          ) : entry.timeLabel ? (
            <time
              dateTime={entry.timeIso}
              className="text-label-sm text-[rgb(var(--color-content-primary)/0.5)]"
            >
              {entry.timeLabel}
            </time>
          ) : null}
        </span>
      </NavLink>
    </li>
  )
}
