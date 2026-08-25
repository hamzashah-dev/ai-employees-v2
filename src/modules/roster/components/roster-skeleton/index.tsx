import type { FC } from 'react'
import { SKELETON_ROW_COUNT } from '../../constants'

/**
 * Loading placeholder. Muted blocks in the row's own geometry and no shimmer —
 * the spinner is the only motion in this design, and a skeleton that pulses
 * would be the second.
 */
export const RosterSkeleton: FC = () => (
  <div className="flex flex-col gap-0.5" role="status" aria-label="Loading your team">
    {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
      <div key={index} className="flex items-center gap-2.5 px-2.5 py-2">
        <div className="size-7 shrink-0 rounded-full bg-[rgb(var(--color-ink-2))]" />
        <div className="min-w-0 flex-1">
          <div className="h-3 w-24 rounded-full bg-[rgb(var(--color-ink-2))]" />
          <div className="mt-2 h-2.5 w-32 rounded-full bg-[rgb(var(--color-ink-2))]" />
        </div>
      </div>
    ))}
  </div>
)
