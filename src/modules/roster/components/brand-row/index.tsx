import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@repo/ui/cn'
import { LayoutSidebarLeftIcon } from '@repo/icons/layout-sidebar-left'
import { ImagineLogo } from '@repo/icons/imagine-logo'
import { SidebarImagineLogoWithText } from '@repo/icons/sidebar-imagine-logo-with-text'
import { ROUTES } from '../../constants'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'

interface BrandRowProps {
  /** Collapses the rail on desktop, dismisses the drawer below `desktop-sm`. */
  onToggle?: () => void
}

/**
 * The sidebar header: the 127x20 wordmark, and the collapse toggle on the right.
 *
 * Collapsed, the wordmark drops to its mark and the toggle moves out of the row — a 127px
 * lockup does not fit a 48px rail, and the toggle would crowd the mark. It comes back with
 * the panel; the rail is expanded again from the mark itself.
 */
export const BrandRow: FC<BrandRowProps> = ({ onToggle }) => {
  const isCollapsed = useSidebarCollapsed()

  return (
    <div
      className={cn(
        'flex shrink-0 items-center p-2',
        isCollapsed ? 'justify-center' : 'justify-between',
      )}
    >
      {isCollapsed ? (
        <button
          type="button"
          aria-label="Expand sidebar"
          aria-expanded={false}
          title="Expand sidebar"
          onClick={onToggle}
          className="group/brand flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ease-linear hover:bg-fill-secondary"
        >
          <ImagineLogo className="size-5 text-primary group-hover/brand:hidden" />
          <LayoutSidebarLeftIcon className="hidden size-4 stroke-[1.2px] text-primary group-hover/brand:block" />
        </button>
      ) : (
        <>
          <Link to={ROUTES.NEW_CHAT} aria-label="Imagine" className="p-[5px]">
            <SidebarImagineLogoWithText className="h-5 w-[127px] shrink-0 text-primary" />
          </Link>

          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-expanded
            title="Collapse sidebar"
            onClick={onToggle}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl text-secondary transition-all duration-200 ease-linear hover:bg-fill-secondary hover:text-primary"
          >
            <LayoutSidebarLeftIcon className="size-4 stroke-[1.2px]" />
          </button>
        </>
      )}
    </div>
  )
}
