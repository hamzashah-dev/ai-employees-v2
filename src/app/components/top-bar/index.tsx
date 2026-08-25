import type { FC } from 'react'
import { BellIcon } from '@repo/icons/bell-icon'
import { cn } from '@repo/ui/cn'
import { AccountAvatar } from '../account-avatar'

/**
 * The main column's title bar, above the dashboard and the marketplace.
 *
 * The thread has its own header instead — it carries an avatar, the employee's name and the
 * panel toggle, so it is a different component rather than this one with slots.
 *
 * The canvas gives this bar no title on the chat home (D1) and a title everywhere else, so
 * `title` is optional and the bar right-aligns without it.
 */
interface TopBarProps {
  title?: string
  className?: string
}

export const TopBar: FC<TopBarProps> = ({ title, className }) => (
  <header
    className={cn(
      'flex h-12 shrink-0 items-center gap-4 px-4',
      title ? 'justify-between' : 'justify-end',
      className,
    )}
  >
    {title ? (
      <span className="truncate text-label-md font-medium text-primary">{title}</span>
    ) : null}

    <div className="flex shrink-0 items-center gap-4">
      {/*
        Notifications have no backing endpoint yet. Rendered as a real control rather than
        omitted, because the canvas places it and the bar reads wrong without it — but it is
        disabled and says why, rather than looking live and doing nothing.
      */}
      <button
        type="button"
        disabled
        aria-label="Notifications — not available yet"
        title="Notifications aren’t available yet"
        className="flex size-4 shrink-0 items-center justify-center text-secondary disabled:cursor-default"
      >
        <BellIcon className="size-4" />
      </button>

      <AccountAvatar />
    </div>
  </header>
)
