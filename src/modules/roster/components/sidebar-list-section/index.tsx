import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'

interface SidebarListSectionProps {
  title: string
  rows: string[]
  /** The design gives the first heading a tighter top pad than the ones after. */
  className?: string
}

/**
 * A default-mode list section — the "Projects" and "History" headings and their
 * rows. Static text rather than links: neither has a route or an endpoint in
 * this app (see `PROJECT_ROWS` in the module constants).
 */
export const SidebarListSection: FC<SidebarListSectionProps> = ({
  title,
  rows,
  className,
}) => {
  const isCollapsed = useSidebarCollapsed()

  // Nothing here survives an icon rail — these rows are text with no glyph — so the whole
  // section goes rather than leaving a stub heading behind.
  if (isCollapsed) return null

  return (
  <>
    <div className={cn('pt-1 pr-1 pl-2', className)}>
      <p className="line-clamp-1 text-label-md font-medium text-tertiary">{title}</p>
    </div>
    {rows.map((row) => (
      <div
        key={row}
        className="flex h-8 shrink-0 items-center rounded-xl px-2 transition-all duration-200 ease-linear hover:bg-fill-variant-hover"
      >
        <span className="truncate text-label-md text-primary">{row}</span>
      </div>
    ))}
  </>
  )
}
