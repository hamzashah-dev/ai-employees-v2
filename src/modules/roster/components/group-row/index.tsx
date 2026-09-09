import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { AlertTriangleIcon } from '@repo/icons/alert-triangle'
import { cn } from '@repo/ui/cn'
import { WithTooltip } from '@repo/ui/tooltip'
import { GroupClusterAvatar } from '@/modules/core/components/group-cluster-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import type { GroupRow as GroupRowData } from '@/modules/core/utils/group-row'
import { formatRosterTime } from '@/modules/core/utils/time'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'
import { useGroupRowState } from './hooks/use-group-row'

interface GroupRowProps {
  row: GroupRowData
}

/**
 * One group in the Team list.
 *
 * Structurally identical to `RosterRow` — same 36px avatar slot, same two-line
 * name/subtitle block, same two trailing slots — because §1g requires "the same
 * three trailing treatments a bot row uses … so a group never invents a signal
 * of its own". The only differences are the cluster in place of a single face and
 * a room id in place of a profile name in the route.
 *
 * The stamp uses `formatRosterTime`, the roster's own formatter, so a room and an
 * employee that last spoke in the same minute read identically. The canvas draws
 * "now" on a freshly created room; that would be a signal an employee row cannot
 * produce, so the shared formatter wins over the sample copy — which is the same
 * rule §1g states in the opposite direction.
 */
export const GroupRow: FC<GroupRowProps> = ({ row }) => {
  const { to, isWorking, needsUser, isUnread } = useGroupRowState(row)
  const timeLabel = formatRosterTime(row.activityMs)
  const isCollapsed = useSidebarCollapsed()

  // Same collapse as `RosterRow`: the cluster alone, name in a tooltip.
  if (isCollapsed) {
    return (
      <li>
        <WithTooltip
          content={row.name}
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
            aria-label={row.name}
            className={({ isActive }) =>
              cn(
                'relative mx-auto flex size-8 items-center justify-center rounded-xl transition-all duration-200 ease-linear hover:bg-fill-variant-hover',
                { 'bg-fill-variant-active': isActive },
              )
            }
          >
            <GroupClusterAvatar members={row.members} size="xs" />
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
        <GroupClusterAvatar members={row.members} />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-label-md font-medium text-primary">{row.name}</span>
            {isWorking ? (
              <span
                role="img"
                aria-label={`${row.speaking} is replying`}
                className="flex shrink-0 items-center"
              >
                <Spinner className="text-secondary" />
              </span>
            ) : (
              timeLabel && (
                <time
                  dateTime={new Date(row.activityMs).toISOString()}
                  className="shrink-0 text-label-xs text-tertiary"
                >
                  {timeLabel}
                </time>
              )
            )}
          </span>
          <span className="truncate text-label-sm text-tertiary">{row.subtitle}</span>
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
