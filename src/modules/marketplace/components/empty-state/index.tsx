import type { FC } from 'react'
import { Button } from '@/modules/core/components/button'

interface EmptyStateProps {
  /** The raw search text, already trimmed. Empty when only a category is on. */
  query: string
  onClear: () => void
}

export const EmptyState: FC<EmptyStateProps> = ({ query, onClear }) => (
  <div className="flex flex-col items-start gap-4 rounded-[16px] border border-[rgb(var(--color-ink-2))] bg-[rgb(var(--color-ink-1))] px-6 py-10">
    <div className="flex flex-col gap-1">
      <p className="text-label-md text-[rgb(var(--color-ink-7))]">
        {query ? `No agents match “${query}”.` : 'Nothing on this shelf yet.'}
      </p>
      <p className="text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">
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
