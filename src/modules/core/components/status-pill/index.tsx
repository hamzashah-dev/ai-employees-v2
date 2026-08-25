import type { FC } from 'react'
import { cn } from '../../utils/cn'
import type { EmployeeStatus } from '../../types/chat'

/**
 * Ready / Working / Needs you.
 *
 * Derived from the socket, not from Hermes: there is no per-profile runtime
 * status field. See EmployeeStatus for the derivation.
 */

const LABELS: Record<EmployeeStatus, string> = {
  ready: 'Ready',
  working: 'Working',
  'needs-you': 'Needs you',
  error: 'Error',
}

const STYLES: Record<EmployeeStatus, string> = {
  ready: 'text-[rgb(var(--color-ink-6))] bg-[rgb(var(--color-ink-2))]',
  working: 'text-[rgb(var(--color-warning))] bg-[rgb(var(--color-warning-bg))]',
  'needs-you': 'text-[rgb(var(--color-brand-soft))] bg-[rgb(var(--color-brand-deep))]',
  error: 'text-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger)/0.12)]',
}

interface StatusPillProps {
  status: EmployeeStatus
  label?: string
  className?: string
}

export const StatusPill: FC<StatusPillProps> = ({ status, label, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-xs font-medium whitespace-nowrap',
      STYLES[status],
      className,
    )}
  >
    {status === 'working' && <Spinner />}
    {label ?? LABELS[status]}
  </span>
)

/** The canvas's single `spin` animation — its only motion. */
export const Spinner: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    className={cn('size-3 animate-spin', className)}
    fill="none"
    aria-hidden
  >
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path
      d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)
