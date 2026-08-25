import type { FC, ReactNode } from 'react'
import { cn } from '@/modules/core/utils/cn'

/**
 * chatly-web's `<Badge size="md" variant="neutral-subtle">`, which resolves to:
 *
 *   font-medium py-0.5 px-1.5 text-label-sm rounded-lg
 *   bg-fill-secondary text-secondary
 *
 * Quiet grey, not a brand colour — a coloured badge on every other row is what
 * made these read as alerts rather than labels.
 */
export const SidebarBadge: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={cn(
      'shrink-0 rounded-lg bg-[rgb(var(--color-fill-secondary))] px-1.5 py-0.5',
      'text-label-sm font-medium text-[rgb(var(--color-content-secondary))]',
      className,
    )}
  >
    {children}
  </span>
)
