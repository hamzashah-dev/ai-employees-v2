import type { FC } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'

interface EmptyStateProps {
  profile: string
  displayName: string
}

/** The empty thread a freshly hired employee opens to, before the first message. */
export const EmptyState: FC<EmptyStateProps> = ({ profile, displayName }) => (
  <div className="flex flex-col items-center gap-3 py-20 text-center">
    <EmployeeAvatar profile={profile} size={48} />
    <p className="text-heading-sm text-primary">{displayName}</p>
    <p className="max-w-[360px] text-label-md text-tertiary">
      Nothing here yet. Describe the work and {displayName} will pick it up.
    </p>
  </div>
)
