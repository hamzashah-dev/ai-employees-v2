import type { FC } from 'react'
import { useLocation } from 'react-router-dom'
import { DEFAULT_NAV_ITEMS, HISTORY_ROWS, PROJECT_ROWS } from '../../constants'
import { useSidebarEmployeesModeStore } from '../../stores/sidebar-employees-mode-store'
import { isEmployeesPath } from '../../utils/is-employees-path'
import { NavRow } from '../nav-row'
import { SidebarEmployeesBody } from '../sidebar-employees-body'
import { SidebarListSection } from '../sidebar-list-section'

/**
 * The sidebar body, in whichever of its two modes the route calls for.
 *
 * The whole body is **replaced, not nested** — the Sites mechanism, an early
 * return on a mode store plus a route predicate. Employees mode sticks while
 * hopping to the customize and integrations pages, so the pathname check only
 * has to cover the very first render on an Employees route, before the sync
 * effect has run.
 */
export const SidebarBody: FC = () => {
  const { pathname } = useLocation()
  const isEmployeesMode = useSidebarEmployeesModeStore((state) => state.isEmployeesMode)

  if (isEmployeesMode || isEmployeesPath(pathname)) return <SidebarEmployeesBody />

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Main">
        <ul className="flex shrink-0 flex-col gap-1 p-2">
          {DEFAULT_NAV_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </ul>
      </nav>

      <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto pl-2">
        <SidebarListSection title="Projects" rows={PROJECT_ROWS} />
        <SidebarListSection title="History" rows={HISTORY_ROWS} className="pt-2" />
      </div>
    </div>
  )
}
