import type { FC } from 'react'
import { EMPLOYEES_NAV_ITEMS, ROUTINES_ITEM } from '../../constants'
import { NavRow } from '../nav-row'
import { RosterList } from '../roster-list'
import { TeamHeading } from '../team-heading'

/**
 * The Employees-mode sidebar body (D3/D6/D11/D15): a four-row nav, the Team
 * heading with its hire `+`, the roster, and Routines pinned above the footer so
 * it stays reachable however long the roster grows.
 */
export const SidebarEmployeesBody: FC = () => (
  <div className="flex min-h-0 flex-1 flex-col">
    <nav aria-label="Employees">
      <ul className="flex shrink-0 flex-col gap-1 p-2">
        {EMPLOYEES_NAV_ITEMS.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </ul>
    </nav>

    <TeamHeading />

    <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2">
      <RosterList />
    </div>

    <div className="shrink-0 px-2 py-1">
      <ul>
        <NavRow item={ROUTINES_ITEM} />
      </ul>
    </div>
  </div>
)
