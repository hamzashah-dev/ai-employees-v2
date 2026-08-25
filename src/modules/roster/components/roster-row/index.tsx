import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { AlertTriangleIcon } from '@repo/icons/alert-triangle'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import type { RosterEntry } from '../../types'
import { useRosterRow } from './hooks/use-roster-row'

interface RosterRowProps {
  entry: RosterEntry
}

/**
 * One employee in the roster: a 28px avatar, the name over its last outcome,
 * and a trailing status.
 *
 * Two slots carry state, exactly as the canvas draws them — the name line's own
 * trailing slot holds the timestamp, replaced by a spinner while the employee is
 * working; the row's outer trailing slot holds the warn glyph when it needs a
 * yes, or the unread dot.
 */
export const RosterRow: FC<RosterRowProps> = ({ entry }) => {
  const { to, isWorking, needsUser, isUnread } = useRosterRow(entry)

  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 ease-linear hover:bg-fill-variant-hover',
            { 'bg-fill-variant-active': isActive },
          )
        }
      >
        <EmployeeAvatar profile={entry.profile} />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-label-md font-medium text-primary">
              {entry.displayName}
            </span>
            {isWorking ? (
              <span
                role="img"
                aria-label={`${entry.displayName} is working`}
                className="flex shrink-0 items-center"
              >
                <Spinner className="text-secondary" />
              </span>
            ) : (
              entry.timeLabel && (
                <time
                  dateTime={entry.timeIso}
                  className="shrink-0 text-label-xs text-tertiary"
                >
                  {entry.timeLabel}
                </time>
              )
            )}
          </span>
          <span className="truncate text-label-sm text-tertiary">{entry.subtitle}</span>
        </span>

        {needsUser && <AlertTriangleIcon className="size-3.5 shrink-0 text-warning" />}
        {!needsUser && isUnread && (
          <span
            role="img"
            aria-label="Unread"
            className="size-1.5 shrink-0 rounded-full bg-primary-30"
          />
        )}
      </NavLink>
    </li>
  )
}
