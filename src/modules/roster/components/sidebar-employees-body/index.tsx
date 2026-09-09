import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { EMPLOYEES_NAV_ITEMS, ROUTINES_ITEM } from '../../constants'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'
import { NavRow } from '../nav-row'
import { RosterList } from '../roster-list'
import { TeamHeading } from '../team-heading'

/**
 * The Employees-mode sidebar body (D3/D6/D11/D15): a four-row nav, the Team
 * heading with its hire `+`, the roster, and Routines pinned above the footer so
 * it stays reachable however long the roster grows.
 *
 * Collapsed (s14 collapsed rail), the Team heading drops — there is no room for
 * its label and hire menu — but the roster itself stays: each row collapses to
 * its own disc instead, exactly as `NavRow` collapses to a bare glyph. The
 * canvas draws four discs, in the rail, below the nav icons.
 */
export const SidebarEmployeesBody: FC = () => {
  const isCollapsed = useSidebarCollapsed()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Employees">
        <ul className="flex shrink-0 flex-col gap-1 p-2">
          {EMPLOYEES_NAV_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </ul>
      </nav>

      {!isCollapsed && <TeamHeading />}

      <div
        className={cn(
          'scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto',
          isCollapsed ? 'gap-1 px-2' : 'px-2',
        )}
      >
        <RosterList />
      </div>

      <div className="shrink-0 px-2 py-1">
        <ul>
          <NavRow item={ROUTINES_ITEM} />
        </ul>
      </div>
    </div>
  )
}
