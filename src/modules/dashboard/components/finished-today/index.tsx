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
 * §4.3's delivered-file chip is not built, and the claim was re-checked against
 * the backend rather than inherited: `HermesSessionRow` carries id, title,
 * preview, stamps, counts, source, model and flags, and nothing else. Hermes's
 * only file surface is `/api/files*` in `computer_cli/web_server.py`, which
 * browses, reads and uploads by *path* — there is no route anywhere that asks
 * "what did this session deliver". A chip would have to invent both the file
 * and the link behind it, so the row is the same shape without one.
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
