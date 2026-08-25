import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { Spinner } from '@/modules/core/components/spinner'

interface WorkingPillProps {
  label?: string
  className?: string
}

/**
 * The employee is mid-turn. Warning-tinted rather than accent-tinted on
 * purpose: it is a "you are waiting on me" state, not a success.
 */
export const WorkingPill: FC<WorkingPillProps> = ({ label = 'Working', className }) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-warning px-2.5 py-1 text-label-sm font-medium whitespace-nowrap text-warning',
      className,
    )}
  >
    <Spinner />
    {label}
  </span>
)
