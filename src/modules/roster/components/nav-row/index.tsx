import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/modules/core/utils/cn'
import {
  SIDEBAR_ICON_CLASSES,
  SIDEBAR_ROW_ACTIVE_CLASSES,
  SIDEBAR_ROW_CLASSES,
} from '../../constants'
import { SidebarBadge } from '../sidebar-badge'
import type { RosterNavItem } from '../../types'

/**
 * A sidebar nav row, ported from chatly-web's `SidebarNavItemBody`.
 *
 * The label is deliberately not `font-medium`: chatly sets only
 * `text-label-md text-primary` on it, and bolding every row is what made this
 * sidebar read heavier than the product's.
 */
export const NavRow: FC<{ item: RosterNavItem }> = ({ item }) => {
  const { to, label, icon: Icon, end, badge } = item

  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(SIDEBAR_ROW_CLASSES, isActive && SIDEBAR_ROW_ACTIVE_CLASSES)
        }
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon className={SIDEBAR_ICON_CLASSES} />
          <span className="truncate text-label-md text-[rgb(var(--color-content-primary))]">
            {label}
          </span>
        </div>
        {badge && <SidebarBadge>{badge}</SidebarBadge>}
      </NavLink>
    </li>
  )
}
