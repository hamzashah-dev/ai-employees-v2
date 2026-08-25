import type { FC } from 'react'
import { AlertTriangleIcon } from '@repo/icons/alert-triangle'
import { cn } from '@repo/ui/cn'

interface MessageErrorProps {
  text: string
  className?: string
}

/**
 * Failures belong next to the turn that failed, not in a toast that disappears
 * before the reader has worked out which message it was about.
 */
export const MessageError: FC<MessageErrorProps> = ({ text, className }) => (
  <p className={cn('flex items-start gap-1.5 text-label-sm text-critical', className)}>
    <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
    <span>{text}</span>
  </p>
)
