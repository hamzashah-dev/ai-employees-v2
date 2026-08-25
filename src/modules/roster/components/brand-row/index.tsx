import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { LayoutSidebarLeftIcon } from '@repo/icons/layout-sidebar-left'
import { SidebarImagineLogoWithText } from '@repo/icons/sidebar-imagine-logo-with-text'
import { ROUTES } from '../../constants'

interface BrandRowProps {
  onToggleCollapse?: () => void
}

/**
 * The sidebar header: the 127x20 wordmark, and the collapse toggle on the right.
 *
 * The toggle is disabled until the app shell passes a handler — collapsing also
 * moves the main column and swaps in a drawer below `desktop-sm`, so the state
 * belongs there rather than here.
 */
export const BrandRow: FC<BrandRowProps> = ({ onToggleCollapse }) => (
  <div className="flex shrink-0 items-center justify-between p-2">
    <Link to={ROUTES.NEW_CHAT} aria-label="Imagine" className="p-[5px]">
      <SidebarImagineLogoWithText className="h-5 w-[127px] shrink-0 text-primary" />
    </Link>

    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={onToggleCollapse}
      disabled={!onToggleCollapse}
      title={onToggleCollapse ? undefined : 'Collapsing the sidebar is not available yet'}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl text-secondary transition-all duration-200 ease-linear hover:bg-fill-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-60"
    >
      <LayoutSidebarLeftIcon className="size-4 stroke-[1.2px]" />
    </button>
  </div>
)
