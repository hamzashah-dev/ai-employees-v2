import type { FC } from 'react'
import { Skeleton } from '@repo/ui/skeleton'
import { SKELETON_ROW_COUNT } from '../../constants'

/** Loading placeholder, in the roster row's own geometry. */
export const RosterSkeleton: FC = () => (
  <div className="flex flex-col gap-0.5" role="status" aria-label="Loading your team">
    {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
      <div key={index} className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="size-7 shrink-0 rounded-full bg-fill-secondary" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-24 rounded-full bg-fill-secondary" />
          <Skeleton className="h-2.5 w-32 rounded-full bg-fill-secondary" />
        </div>
      </div>
    ))}
  </div>
)
