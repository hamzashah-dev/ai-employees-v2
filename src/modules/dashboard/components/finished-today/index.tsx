import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import type { FinishedItem } from '../../utils/derive-sections'
import { DashboardSection } from '../dashboard-section'

interface FinishedTodayProps {
  items: FinishedItem[]
}

/**
 * Today's outcomes, one line each.
 *
 * The canvas's file chip is not built: a session row carries no artifacts —
 * `HermesSessionRow` is a chat row, and Hermes has no per-session file list —
 * so there is nothing to name in a chip. The row is the same shape without it.
 */
export const FinishedToday: FC<FinishedTodayProps> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <DashboardSection title="Finished today" className="gap-1.5">
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li
            key={item.profile}
            className={cn('flex items-center gap-3 px-1 py-2', {
              'border-b border-primary': index < items.length - 1,
            })}
          >
            <EmployeeAvatar profile={item.profile} className="size-6" />
            <span className="shrink-0 text-label-md font-medium text-primary">
              {item.displayName}
            </span>
            <span className="min-w-0 flex-1 truncate text-label-md text-secondary">
              {item.summary}
            </span>
            {item.timeLabel && (
              <time
                dateTime={item.timeIso}
                className="ml-auto shrink-0 text-label-sm text-tertiary"
              >
                {item.timeLabel}
              </time>
            )}
          </li>
        ))}
      </ul>
    </DashboardSection>
  )
}
