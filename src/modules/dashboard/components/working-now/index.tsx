import type { FC } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { useElapsed } from '../../hooks/use-elapsed'
import type { WorkingItem } from '../../utils/derive-sections'
import { DashboardSection } from '../dashboard-section'

interface WorkingNowProps {
  items: WorkingItem[]
}

/** Whoever is mid-turn, with how long they have been at it. */
export const WorkingNow: FC<WorkingNowProps> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <DashboardSection title="Working now" className="gap-2.5">
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <WorkingCard key={item.profile} item={item} />
        ))}
      </div>
    </DashboardSection>
  )
}

const WorkingCard: FC<{ item: WorkingItem }> = ({ item }) => {
  const elapsed = useElapsed(item.since)

  return (
    <article className="flex w-full max-w-[420px] items-center gap-3 rounded-2xl border border-primary bg-fill-elevated px-4 py-3.5">
      <EmployeeAvatar profile={item.profile} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-label-md text-primary">{item.task}</p>
          {elapsed && (
            <span className="shrink-0 font-robotoMono text-label-sm text-tertiary">
              {elapsed}
            </span>
          )}
        </div>

        {/*
          Indeterminate on purpose. Nothing in the Hermes event stream carries a
          fraction of work done — there is no total to divide by — so the bar
          shows that a turn is running without claiming how far along it is. The
          canvas's fixed 22%→60% fill would be a number we invented.

          §4.3's two tokens exactly: a 4px `bg-fill-brand` bar on a
          `bg-fill-tertiary` track. The pulse rather than a sweeping segment
          because a travelling bar needs a translate keyframe, and the token
          layer ships none — `shimmer` and `shine` both move a
          background-position and `src/styles/globals.css` is not this module's
          to extend. `animate-pulse` is Tailwind's own and says the same thing:
          running, length unknown.
        */}
        <div
          role="progressbar"
          aria-label={`${item.displayName} is working`}
          className="h-1 overflow-hidden rounded-sm bg-fill-tertiary"
        >
          <span className="block size-full animate-pulse bg-fill-brand" />
        </div>
      </div>
    </article>
  )
}
