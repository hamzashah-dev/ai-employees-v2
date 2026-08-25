import type { FC } from 'react'
import { BrandRow } from './components/brand-row'
import { SidebarBody } from './components/sidebar-body'
import { SidebarFooter } from './components/sidebar-footer'
import { WorkspaceSwitcher } from './components/workspace-switcher'
import { useSyncSidebarEmployeesMode } from './hooks/use-sync-sidebar-employees-mode'
import type { RosterSidebarProps } from './types'

/**
 * The left sidebar: 256px, a hairline right border, and four pinned bands —
 * brand row, workspace pill, body, footer. Only the body scrolls, and the body
 * is swapped wholesale between the default and Employees modes.
 */
export const RosterSidebar: FC<RosterSidebarProps> = ({ onToggleCollapse }) => {
  useSyncSidebarEmployeesMode()

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-primary bg-primary">
      <BrandRow onToggleCollapse={onToggleCollapse} />
      <WorkspaceSwitcher />
      <SidebarBody />
      <SidebarFooter />
    </aside>
  )
}

export type { RosterSidebarProps }
