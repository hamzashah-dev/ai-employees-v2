import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { AlertTriangleIcon } from '@repo/icons/alert-triangle'
import { cn } from '@repo/ui/cn'
import { WithTooltip } from '@repo/ui/tooltip'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'
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
 *
 * Collapsed (s14 collapsed rail), the row is the avatar alone — the working
 * face already carries the spinner's signal, so nothing else needs to fit in
 * the 32px hit area — with the name in a right-hand tooltip, same as `NavRow`.
 */
export const RosterRow: FC<RosterRowProps> = ({ entry }) => {
  const { to, isWorking, needsUser, isUnread } = useRosterRow(entry)
  const isCollapsed = useSidebarCollapsed()

  if (isCollapsed) {
    return (
      <li>
        <WithTooltip
          content={entry.displayName}
          showArrow={false}
          tooltipContentProps={{
            side: 'right',
            sideOffset: 8,
            className:
              'rounded-xl border border-primary bg-surface-variant text-label-sm text-primary shadow-md',
          }}
        >
          <NavLink
            to={to}
            aria-label={entry.displayName}
            className={({ isActive }) =>
              cn(
                'relative mx-auto flex size-8 items-center justify-center rounded-xl transition-all duration-200 ease-linear hover:bg-fill-variant-hover',
                { 'bg-fill-variant-active': isActive },
              )
            }
          >
            <EmployeeAvatar profile={entry.profile} size={28} busy={isWorking} />
            {needsUser && (
              <AlertTriangleIcon className="absolute -right-0.5 -bottom-0.5 size-3.5 shrink-0 text-warning" />
            )}
            {!needsUser && isUnread && (
              <span
                role="img"
                aria-label="Unread"
                className="absolute right-0 bottom-0 size-1.5 shrink-0 rounded-full bg-primary-30"
              />
            )}
          </NavLink>
        </WithTooltip>
      </li>
    )
  }

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
