import type { FC } from 'react'
import { Skeleton } from '@repo/ui/skeleton'

/** Stands in for one routine row while the list loads. */
export const RoutineSkeleton: FC = () => (
  <li className="flex items-start gap-2.5 px-1 py-2">
    <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full bg-fill-elevated" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/2 bg-fill-elevated" />
      <Skeleton className="h-2.5 w-1/3 bg-fill-elevated" />
    </div>
  </li>
)
