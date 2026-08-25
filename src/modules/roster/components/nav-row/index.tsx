import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
import { SIDEBAR_ROW_CLASSES } from '../../constants'
import type { RosterNavItem } from '../../types'

interface NavRowProps {
  item: RosterNavItem
}

/**
 * A sidebar nav row, ported from imagine-computer-web's `SidebarNavItemBody`.
 *
 * The label is deliberately not `font-medium` — the shipped row sets only
 * `text-label-md text-primary`, and the canvas draws it at weight 400 too.
 */
export const NavRow: FC<NavRowProps> = ({ item: { to, label, icon: Icon, end, badge } }) => (
  <li>
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(SIDEBAR_ROW_CLASSES, { 'bg-fill-variant-active': isActive })
      }
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 stroke-[1.2px] text-primary transition-all duration-200 ease-linear" />
        <p className="truncate text-label-md text-primary">{label}</p>
      </div>
      {badge && (
        <Badge size="md" variant="neutral-subtle">
          {badge}
        </Badge>
      )}
    </NavLink>
  </li>
)
