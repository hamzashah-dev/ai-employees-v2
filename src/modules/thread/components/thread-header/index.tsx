import type { FC } from 'react'
import { MonitorIcon } from '@repo/icons/monitor'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { toInitials } from '@/modules/core/utils/identity'
import { ACCOUNT_NAME } from '../../constants'

interface ThreadHeaderProps {
  profile: string
  displayName: string
  panelOpen: boolean
  onTogglePanel: () => void
}

/**
 * The thread's top bar: who you are talking to on the left, the screen toggle
 * and your own avatar on the right. No hairline under it — the canvas separates
 * the bar from the transcript with space, not a border.
 */
export const ThreadHeader: FC<ThreadHeaderProps> = ({
  profile,
  displayName,
  panelOpen,
  onTogglePanel,
}) => (
  <header className="flex h-12 shrink-0 items-center justify-between px-4">
    <div className="flex min-w-0 items-center gap-2">
      <EmployeeAvatar profile={profile} className="size-6" />
      <span className="truncate text-label-md font-medium text-primary">{displayName}</span>
    </div>

    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="icon-ghost"
        size="icon-sm"
        shape="pill"
        aria-label="Toggle employee panel"
        aria-pressed={panelOpen}
        onClick={onTogglePanel}
        className={cn('text-secondary [&>svg]:size-4', {
          'bg-fill-elevated-hover text-primary': panelOpen,
        })}
      >
        <MonitorIcon />
      </Button>

      <span
        role="img"
        aria-label={ACCOUNT_NAME}
        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-fill-tertiary text-label-sm font-medium text-primary"
      >
        {toInitials(ACCOUNT_NAME)}
      </span>
    </div>
  </header>
)
