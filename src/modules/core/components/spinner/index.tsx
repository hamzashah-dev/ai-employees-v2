import type { FC } from 'react'
import { LoaderIcon } from '@repo/icons/loader'
import { cn } from '@repo/ui/cn'

/**
 * The one piece of motion in this design.
 *
 * `LoaderIcon` ships without an animation, so the spin is applied here rather than at each
 * of the dozen call sites.
 */
export const Spinner: FC<{ className?: string }> = ({ className }) => (
  <LoaderIcon className={cn('size-3 animate-spin', className)} />
)
