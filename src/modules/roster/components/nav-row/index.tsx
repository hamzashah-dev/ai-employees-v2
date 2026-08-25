import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
import { WithTooltip } from '@repo/ui/tooltip'
import { SIDEBAR_ROW_CLASSES } from '../../constants'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'
import type { RosterNavItem } from '../../types'
import { NavLiveIndicator } from '../nav-live-indicator'

interface NavRowProps {
  item: RosterNavItem
}

/**
 * A sidebar nav row, ported from imagine-computer-web's `SidebarNavItemBody`.
 *
 * The label is deliberately not `font-medium` — the shipped row sets only
 * `text-label-md text-primary`, and the canvas draws it at weight 400 too.
 *
 * The row is a `NavLink` or a `button` depending on what the item is (see
 * `RosterNavItem`), which is upstream's split too: its `SidebarNavItemBody`
 * exists "so the same styling backs both a `<Link>` item and a `<button>` item
 * (e.g. a modal trigger)". Both share one class function and one body here, so
 * neither is the other's exception; a button simply has no active state.
 *
 * Collapsed, each row gets the right-hand tooltip §3.1 and §4.2 ask for, with
 * upstream's exact configuration — `side: 'right'`, `sideOffset: 8`, no arrow,
 * and its own class list rather than the `bg-fill-inverse` the tooltip variant
 * defaults to. Two details are load-bearing and were found by measuring:
 *
 * - It is `WithTooltip`, which *wraps*, not a `TooltipTrigger asChild`, which
 *   *clones*. Radix's Slot merges `className` by string concatenation, so
 *   cloning a NavLink stringifies its `({ isActive }) => …` render prop into
 *   the class attribute and the row renders with no styling whatsoever.
 * - The tooltip is always mounted and hidden when expanded, again as upstream
 *   does it, so the row has one code path rather than two.
 */
export const NavRow: FC<NavRowProps> = ({ item }) => {
  const isCollapsed = useSidebarCollapsed()
  const { label, icon: Icon, badge, live } = item

  const rowClasses = (isActive: boolean): string =>
    isCollapsed
      ? cn(
          // `relative` anchors the collapsed live dot to the row box.
          'relative mx-auto flex size-8 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ease-linear hover:bg-fill-variant-hover',
          { 'bg-fill-variant-active': isActive },
        )
      : cn(SIDEBAR_ROW_CLASSES, { 'bg-fill-variant-active': isActive })

  const staticBadge =
    badge && !isCollapsed ? (
      <Badge size="md" variant="neutral-subtle">
        {badge}
      </Badge>
    ) : null

  const body = (
    <>
      <div className={cn('flex min-w-0 items-center', { 'gap-2': !isCollapsed })}>
        <Icon className="size-4 shrink-0 stroke-[1.2px] text-primary transition-all duration-200 ease-linear" />
        {!isCollapsed && <p className="truncate text-label-md text-primary">{label}</p>}
      </div>
      {live ? <NavLiveIndicator>{staticBadge}</NavLiveIndicator> : staticBadge}
    </>
  )

  return (
    <li>
      <WithTooltip
        content={label}
        showArrow={false}
        tooltipContentProps={{
          side: 'right',
          sideOffset: 8,
          className: cn(
            'rounded-xl border border-primary bg-surface-variant text-label-sm text-primary shadow-md',
            { hidden: !isCollapsed },
          ),
        }}
      >
        {'to' in item ? (
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) => rowClasses(isActive)}
          >
            {body}
          </NavLink>
        ) : (
          <button type="button" onClick={item.onSelect} className={rowClasses(false)}>
            {body}
          </button>
        )}
      </WithTooltip>
    </li>
  )
}
