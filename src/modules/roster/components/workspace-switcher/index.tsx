import type { FC } from 'react'
import { ExpandMenuIcon } from '@repo/icons/expand-menu-icon'
import { cn } from '@repo/ui/cn'
import { WORKSPACE_LOGO_GRADIENT, WORKSPACE_NAME } from '../../constants'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'

/**
 * The workspace pill under the brand row.
 *
 * Geometry from the canvas, treatment from the shipped `SidebarPlatformSwitcher`. Static
 * rather than a dropdown: a build talks to exactly one Hermes install, so there is nothing
 * to switch to yet — the trailing chevron is the affordance the design draws, held for when
 * there is.
 *
 * The mark is the Computer platform's own gradient orb — see `WORKSPACE_LOGO_GRADIENT` for
 * why it is CSS here rather than the upstream CDN still.
 */
export const WorkspaceSwitcher: FC = () => {
  const isCollapsed = useSidebarCollapsed()

  return (
    <div className={cn('shrink-0 pb-1', isCollapsed ? 'px-2' : 'px-1.5')}>
      <div
        className={cn(
          'flex h-9 w-full items-center overflow-hidden rounded-xl',
          isCollapsed
            ? 'justify-center'
            : 'gap-1.5 border border-secondary bg-surface-variant px-2 shadow-xs',
        )}
        title={isCollapsed ? WORKSPACE_NAME : undefined}
      >
        <span
          aria-hidden
          className={cn('size-[18px] shrink-0 rounded-full', WORKSPACE_LOGO_GRADIENT)}
        />
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-label-lg font-medium text-primary">
              {WORKSPACE_NAME}
            </span>
            <ExpandMenuIcon className="size-4 shrink-0 text-secondary" />
          </>
        )}
      </div>
    </div>
  )
}
