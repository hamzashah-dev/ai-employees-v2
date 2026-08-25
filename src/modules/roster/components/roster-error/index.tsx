import type { FC } from 'react'
import { Button } from '@repo/ui/button'

interface RosterErrorProps {
  message: string
  onRetry: () => void
}

/**
 * Inline and compact: the sidebar is 256px wide and the rest of the app still
 * works, so this reports the failure where the list would be rather than taking
 * over the screen.
 */
export const RosterError: FC<RosterErrorProps> = ({ message, onRetry }) => (
  <div role="alert" className="rounded-xl border border-primary px-2 py-2.5">
    <p className="text-label-sm text-secondary">{message}</p>
    <Button variant="outline" size="xs" className="mt-2.5" onClick={onRetry}>
      Retry
    </Button>
  </div>
)
