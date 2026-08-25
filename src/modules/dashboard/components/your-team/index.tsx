import type { FC } from 'react'
import { Badge, type BadgeProps } from '@repo/ui/badge'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import type { EmployeeStatus } from '@/modules/core/types/chat'
import type { TeamItem } from '../../utils/derive-sections'
import { DashboardSection } from '../dashboard-section'

interface YourTeamProps {
  items: TeamItem[]
}

/**
 * Ready / Working / Needs you — the canvas's three pills.
 *
 * `error` folds into "Needs you": it is a fourth state the socket can produce
 * and it wants the same thing from the reader, and the canvas's vocabulary has
 * no fourth pill.
 */
const PILL: Record<EmployeeStatus, { label: string; variant: BadgeProps['variant'] }> = {
  ready: { label: 'Ready', variant: 'neutral-subtle' },
  working: { label: 'Working', variant: 'brand-on-surface' },
  'needs-you': { label: 'Needs you', variant: 'warning' },
  error: { label: 'Needs you', variant: 'warning' },
}

/**
 * The whole roster as cards.
 *
 * The role line is `profile.description`. Hermes has no role field — the canvas's
 * "Email triage" is a short description, and `description` is the only prose a
 * profile carries — so cards whose profile has none simply show the name.
 */
export const YourTeam: FC<YourTeamProps> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <DashboardSection title="Your team" className="gap-2.5">
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
        {items.map((item) => {
          const pill = PILL[item.status]

          return (
            <article
              key={item.profile}
              className="flex items-center gap-3 rounded-2xl border border-primary bg-fill px-4 py-3.5"
            >
              <EmployeeAvatar profile={item.profile} className="size-10" />

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-label-md font-medium text-primary">
                  {item.displayName}
                </p>
                {item.role && (
                  <p className="truncate text-label-sm text-tertiary">{item.role}</p>
                )}
              </div>

              <Badge variant={pill.variant} className="shrink-0 rounded-full px-2">
                {pill.label}
              </Badge>
            </article>
          )
        })}
      </div>
    </DashboardSection>
  )
}
