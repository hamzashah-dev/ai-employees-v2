import type { FC } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'

interface EmptyStateProps {
  profile: string
  displayName: string
}

/**
 * Not drawn on the canvas — every artboard shows a thread mid-conversation.
 * Built from the canvas's own parts so a fresh hire reads as the same surface.
 */
export const EmptyState: FC<EmptyStateProps> = ({ profile, displayName }) => (
  <div className="flex flex-col items-center gap-3 py-20 text-center">
    <EmployeeAvatar profile={profile} size={48} />
    <p className="text-heading-sm text-primary">{displayName}</p>
    <p className="max-w-[360px] text-label-md text-tertiary">
      Nothing here yet. Describe the work and {displayName} will pick it up.
    </p>
  </div>
)
