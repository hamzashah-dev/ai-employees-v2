import type { FC } from 'react'
import { Button } from '@/modules/core/components/button'

interface RosterErrorProps {
  message: string
  onRetry: () => void
}

/**
 * Inline and compact: the roster is 256px wide and the rest of the app still
 * works, so this reports the failure where the list would be rather than
 * taking over the screen.
 */
export const RosterError: FC<RosterErrorProps> = ({ message, onRetry }) => (
  <div
    role="alert"
    className="rounded-[12px] border border-[rgb(var(--color-ink-3))] px-2.5 py-2.5"
  >
    <p className="text-label-sm text-[rgb(var(--color-ink-6))]">{message}</p>
    <Button variant="outline" size="sm" className="mt-2.5" onClick={onRetry}>
      Retry
    </Button>
  </div>
)
