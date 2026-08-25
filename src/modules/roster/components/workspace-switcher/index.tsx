import type { FC } from 'react'
import { ExpandMenuIcon } from '@repo/icons/expand-menu-icon'
import { ImagineLogo } from '@repo/icons/imagine-logo'
import { WORKSPACE_NAME } from '../../constants'

/**
 * The workspace pill under the brand row.
 *
 * Geometry from the canvas, treatment from the shipped
 * `SidebarPlatformSwitcher`. Static rather than a dropdown: a build talks to
 * exactly one Hermes install, so there is nothing to switch to yet — the
 * trailing chevron is the affordance the design draws, held for when there is.
 */
export const WorkspaceSwitcher: FC = () => (
  <div className="shrink-0 px-1.5 pb-1">
    <div className="flex h-9 w-full items-center gap-1.5 overflow-hidden rounded-xl border border-secondary bg-surface-variant px-2 shadow-xs">
      <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-tertiary bg-fill-secondary">
        <ImagineLogo className="size-2.5 text-primary" />
      </span>
      <span className="min-w-0 flex-1 truncate text-left text-label-lg font-medium text-primary">
        {WORKSPACE_NAME}
      </span>
      <ExpandMenuIcon className="size-4 shrink-0 text-secondary" />
    </div>
  </div>
)
