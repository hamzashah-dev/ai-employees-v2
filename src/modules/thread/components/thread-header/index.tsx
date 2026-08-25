import type { FC } from 'react'
import { MenuIcon } from '@repo/icons/menu'
import { MonitorIcon } from '@repo/icons/monitor'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { AccountAvatar } from '@/modules/core/components/account-avatar'

interface ThreadHeaderProps {
  profile: string
  displayName: string
  panelOpen: boolean
  onTogglePanel: () => void
  /** Opens the sidebar drawer. Only shown below `desktop-sm`, where the panel is hidden. */
  onOpenSidebar?: () => void
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
  onOpenSidebar,
}) => (
  <header className="flex h-12 shrink-0 items-center justify-between px-4">
    <div className="flex min-w-0 items-center gap-2">
      {onOpenSidebar ? (
        <Button
          type="button"
          variant="icon-ghost"
          size="icon-sm"
          shape="pill"
          aria-label="Open sidebar"
          onClick={onOpenSidebar}
          className="shrink-0 text-secondary desktop-sm:hidden [&>svg]:size-5"
        >
          <MenuIcon />
        </Button>
      ) : null}
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

      <AccountAvatar />
    </div>
  </header>
)
