import { create } from 'zustand'

interface SidebarEmployeesModeStore {
  isEmployeesMode: boolean
  setEmployeesMode: (isEmployeesMode: boolean) => void
}

/**
 * Whether the sidebar shows its Employees body instead of the default nav.
 *
 * A direct port of imagine-computer-web's `sidebar-build-mode-store` (the Sites
 * mechanism): plain zustand, deliberately **not** persisted. The mode is
 * route-derived — `useSyncSidebarEmployeesMode` is the only writer — and this
 * store exists purely so the mode can stick across the routes that are shared
 * with the rest of the app (`/customize`, `/integrations`), which the pathname
 * alone cannot tell you.
 */
export const useSidebarEmployeesModeStore = create<SidebarEmployeesModeStore>((set) => ({
  isEmployeesMode: false,
  setEmployeesMode: (isEmployeesMode) => set({ isEmployeesMode }),
}))
