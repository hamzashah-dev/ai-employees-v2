import { create } from 'zustand'

const STORAGE_KEY = 'employees:sidebar-collapsed'

const read = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const write = (collapsed: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  } catch {
    // Private browsing or disabled storage — losing the preference is fine.
  }
}

interface SidebarCollapsedStore {
  isCollapsed: boolean
  toggleCollapsed: () => void
}

/**
 * Whether the sidebar is the icon rail rather than the full panel.
 *
 * Persisted per device, matching upstream — it keeps its own cookie so the choice survives a
 * reload. Read straight from storage at creation rather than in an effect, so the first paint
 * is already the right width instead of flashing expanded.
 *
 * Only consulted from `desktop-sm` up; below that the sidebar is a drawer and the same
 * control opens and closes it instead.
 */
export const useSidebarCollapsedStore = create<SidebarCollapsedStore>((set) => ({
  isCollapsed: read(),
  toggleCollapsed: () =>
    set((state) => {
      const isCollapsed = !state.isCollapsed
      write(isCollapsed)
      return { isCollapsed }
    }),
}))
