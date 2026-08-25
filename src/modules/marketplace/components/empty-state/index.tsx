import type { FC } from 'react'
import { Button } from '@repo/ui/button'

interface EmptyStateProps {
  /** The raw search text, already trimmed. Empty when only a category is on. */
  query: string
  onClear: () => void
}

/**
 * Nothing on the canvas — it draws a full catalog — but a search that matches
 * nothing has to say so, and say how to get back.
 */
export const EmptyState: FC<EmptyStateProps> = ({ query, onClear }) => (
  <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-primary bg-fill-elevated px-6 py-10">
    <div className="flex flex-col gap-1">
      <p className="text-label-lg font-medium text-primary">
        {query ? `No agents match “${query}”.` : 'Nothing on this shelf yet.'}
      </p>
      <p className="text-label-sm text-tertiary">
        {query
          ? 'Try a shorter word, or clear the search and browse the shelves.'
          : 'Every other category still has agents in it.'}
      </p>
    </div>
    <Button variant="outline" size="sm" onClick={onClear}>
      {query ? 'Clear search' : 'Show all agents'}
    </Button>
  </div>
)
