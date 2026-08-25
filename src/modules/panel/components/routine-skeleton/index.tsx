import type { FC } from 'react'
import { SkeletonBar } from '../skeleton-bar'

/** Stands in for one routine row while the list loads. */
export const RoutineSkeleton: FC = () => (
  <li className="flex items-start gap-3 px-3 py-2.5">
    <SkeletonBar className="mt-0.5 size-4 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonBar className="h-3 w-1/2" />
      <SkeletonBar className="h-2.5 w-1/3" />
    </div>
  </li>
)
