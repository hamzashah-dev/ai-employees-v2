import type { FC } from 'react'
import { SettingsIcon } from '@repo/icons/settings'
import { AccountAvatar } from '@/modules/core/components/account-avatar'
import { cn } from '@repo/ui/cn'
import { ACCOUNT_NAME, ACCOUNT_PLAN } from '@/modules/core/constants/account'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'

/**
 * The account row: initials avatar, name over plan, settings on the right,
 * separated from the body by a full-bleed hairline.
 *
 * Name and plan are constants — Hermes has no identity or billing endpoint.
 * Settings is disabled for the same reason: there is nothing behind it yet.
 */
export const SidebarFooter: FC = () => {
  const isCollapsed = useSidebarCollapsed()

  return (
    <div className={cn('shrink-0 border-t border-primary', isCollapsed ? 'p-2' : 'p-3')}>
      <div
        className={cn('flex items-center gap-2', { 'justify-center': isCollapsed })}
        title={isCollapsed ? `${ACCOUNT_NAME} · ${ACCOUNT_PLAN}` : undefined}
      >
        <AccountAvatar className={cn({ 'size-10 text-label-md': !isCollapsed })} />

        {!isCollapsed && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label-md text-primary">{ACCOUNT_NAME}</span>
            <span className="truncate text-label-xs text-tertiary">{ACCOUNT_PLAN}</span>
          </span>
        )}

        {!isCollapsed && (
          <button
            type="button"
            aria-label="Settings"
            title="Settings are not available yet"
            disabled
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary transition-all duration-200 ease-linear hover:bg-fill-secondary disabled:pointer-events-none disabled:opacity-60"
          >
            <SettingsIcon className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}
