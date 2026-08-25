import type { FC } from 'react'
import { cn } from '@/modules/core/utils/cn'

/**
 * A loading placeholder.
 *
 * Static on purpose: the canvas's only motion is the spinner, so a shimmering
 * skeleton would be the one animated thing in the product.
 */
export const SkeletonBar: FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden className={cn('rounded-[4px] bg-[rgb(var(--color-ink-2))]', className)} />
)
