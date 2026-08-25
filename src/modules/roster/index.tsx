import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { BrandRow } from './components/brand-row'
import { SidebarBody } from './components/sidebar-body'
import { SidebarFooter } from './components/sidebar-footer'
import { WorkspaceSwitcher } from './components/workspace-switcher'
import { SidebarCollapsedProvider } from './contexts/sidebar-collapsed'
import { useSyncSidebarEmployeesMode } from './hooks/use-sync-sidebar-employees-mode'
import { useSidebarCollapsedStore } from './stores/sidebar-collapsed-store'
import type { RosterSidebarProps } from './types'

/**
 * The left sidebar: four pinned bands — brand row, workspace pill, body, footer. Only the
 * body scrolls, and the body is swapped wholesale between the default and Employees modes.
 *
 * 256px expanded, a 48px icon rail collapsed — the shipped
 * `--sidebar-expanded-width` / `--sidebar-collapsed-width`. Inside the drawer it is always
 * expanded: there is no room to collapse something that is already an overlay, and the same
 * control dismisses it instead.
 */
export const RosterSidebar: FC<RosterSidebarProps> = ({ collapsible = true, onDismiss }) => {
  useSyncSidebarEmployeesMode()
  const storedCollapsed = useSidebarCollapsedStore((state) => state.isCollapsed)
  const toggleCollapsed = useSidebarCollapsedStore((state) => state.toggleCollapsed)

  const isCollapsed = collapsible && storedCollapsed

  return (
    <SidebarCollapsedProvider isCollapsed={isCollapsed}>
      <aside
        className={cn(
          // `min-w-0` is load-bearing: a flex item's automatic minimum size would otherwise
          // floor the rail at its rows' min-content width and the collapse would do nothing.
          'flex h-full min-h-0 min-w-0 shrink-0 flex-col border-r border-primary bg-primary',
          'transition-[width] duration-200 ease-linear',
          isCollapsed ? 'w-12' : 'w-64',
        )}
      >
        <BrandRow onToggle={collapsible ? toggleCollapsed : onDismiss} />
        <WorkspaceSwitcher />
        <SidebarBody />
        <SidebarFooter />
      </aside>
    </SidebarCollapsedProvider>
  )
}

export type { RosterSidebarProps }
