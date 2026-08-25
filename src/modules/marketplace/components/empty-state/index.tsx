import type { FC } from 'react'
import { Button } from '@repo/ui/button'

interface EmptyStateProps {
  /** The raw search text, already trimmed. Empty when only a tab is narrowing. */
  query: string
  /** What is narrowing the page besides the search — a category, or a tab. */
  scope?: string
  onClear: () => void
}

/**
 * Nothing on the canvas — it draws a full catalog — but a filter that matches
 * nothing has to say so, and say how to get back.
 *
 * It names the narrowing when there is one, because "no agents match “budget”"
 * is a confusing thing to read while looking at a page that is also pinned to
 * one category or one maker tab. The sort is deliberately never mentioned: an
 * ordering cannot empty a page, so blaming it would send the user to the wrong
 * control.
 */
export const EmptyState: FC<EmptyStateProps> = ({ query, scope, onClear }) => (
  <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-primary bg-fill-elevated px-6 py-10">
    <div className="flex flex-col gap-1">
      <p className="text-label-lg font-medium text-primary">
        {query && scope
          ? `No agents in ${scope} match “${query}”.`
          : query
            ? `No agents match “${query}”.`
            : scope
              ? `Nothing in ${scope} yet.`
              : 'Nothing here yet.'}
      </p>
      <p className="text-label-sm text-tertiary">
        {query
          ? 'Try a shorter word, or clear the filters and browse the shelves.'
          : 'The rest of the catalog is still there behind Discover.'}
      </p>
    </div>
    <Button variant="outline" size="sm" onClick={onClear}>
      {query || scope ? 'Clear filters' : 'Show all agents'}
    </Button>
  </div>
)
