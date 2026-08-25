import { createContext, useContext, type FC, type ReactNode } from 'react'

/**
 * Whether the sidebar is currently the icon rail.
 *
 * A context rather than a threaded prop because the rows that need it sit three levels down,
 * and because the answer is not simply "what does the store say" — inside the below-`desktop-sm`
 * drawer the sidebar is always expanded regardless of the stored preference. Mirrors the
 * shipped `useSidebar()`.
 */
const SidebarCollapsedContext = createContext(false)

export const SidebarCollapsedProvider: FC<{
  isCollapsed: boolean
  children: ReactNode
}> = ({ isCollapsed, children }) => (
  <SidebarCollapsedContext.Provider value={isCollapsed}>
    {children}
  </SidebarCollapsedContext.Provider>
)

export const useSidebarCollapsed = (): boolean => useContext(SidebarCollapsedContext)
