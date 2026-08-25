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
 * The roster is dropped from the icon rail rather than squeezed into it. A row here is an
 * identity disc plus a name over its last outcome — the disc alone would tower over the 16px
 * nav glyphs beside it, and the outcome line is the reason the row exists. Nav, Routines and
 * the footer all have honest glyph forms; this does not, so it waits for the panel.
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

      {!isCollapsed && (
        <>
          <TeamHeading />

          <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2">
            <RosterList />
          </div>
        </>
      )}

      <div className={cn('shrink-0 py-1', isCollapsed ? 'mt-auto px-2' : 'px-2')}>
        <ul>
          <NavRow item={ROUTINES_ITEM} />
        </ul>
      </div>
    </div>
  )
}
