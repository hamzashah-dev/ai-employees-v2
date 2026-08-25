import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSidebarEmployeesModeStore } from '../../stores/sidebar-employees-mode-store'
import { isEmployeesPath, isModeStickyPath } from '../../utils/is-employees-path'

/**
 * Keeps the sidebar's Employees mode in sync with navigation, mirroring
 * `useSyncSidebarBuildMode`: an Employees route turns it on, a sticky route
 * leaves it as-is, every other route turns it off.
 *
 * Entry and exit are 100% route-derived — nothing clicks the mode on. The nav
 * rows are plain `NavLink`s. Upstream reads the pathname from `usePathname`;
 * here it is `useLocation`, which is the only difference.
 */
export const useSyncSidebarEmployeesMode = () => {
  const { pathname } = useLocation()
  const setEmployeesMode = useSidebarEmployeesModeStore((state) => state.setEmployeesMode)

  useEffect(() => {
    if (isEmployeesPath(pathname)) {
      setEmployeesMode(true)
      return
    }

    if (!isModeStickyPath(pathname)) {
      setEmployeesMode(false)
    }
  }, [pathname, setEmployeesMode])
}
