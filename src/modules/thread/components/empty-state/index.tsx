import type { FC } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'

interface EmptyStateProps {
  profile: string
  displayName: string
}

export const EmptyState: FC<EmptyStateProps> = ({ profile, displayName }) => (
  <div className="flex flex-col items-center gap-3 py-20 text-center">
    <EmployeeAvatar profile={profile} size={48} />
    <p className="text-heading-sm text-[rgb(var(--color-ink-7))]">{displayName}</p>
    <p className="max-w-[360px] text-label-md text-[rgb(var(--color-ink-7)/0.5)]">
      Nothing here yet. Describe the work and {displayName} will pick it up.
    </p>
  </div>
)
