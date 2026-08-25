import type { FC } from 'react'
import { Button } from '@/modules/core/components/button'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { ScreenIcon } from '@/modules/core/components/icon'

interface ThreadHeaderProps {
  profile: string
  displayName: string
  panelOpen: boolean
  onTogglePanel: () => void
}

export const ThreadHeader: FC<ThreadHeaderProps> = ({
  profile,
  displayName,
  panelOpen,
  onTogglePanel,
}) => (
  <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--color-ink-2))] bg-[rgb(var(--color-ink-0))] px-4">
    <div className="flex min-w-0 items-center gap-2">
      <EmployeeAvatar profile={profile} size={24} />
      <span className="truncate text-label-md font-medium text-[rgb(var(--color-ink-7))]">
        {displayName}
      </span>
    </div>

    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle employee panel"
      aria-pressed={panelOpen}
      onClick={onTogglePanel}
      className={
        panelOpen ? 'bg-[rgb(var(--color-ink-2))] text-[rgb(var(--color-ink-7))]' : undefined
      }
    >
      <ScreenIcon />
    </Button>
  </header>
)
