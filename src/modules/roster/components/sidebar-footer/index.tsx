import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { SettingsIcon } from '@repo/icons/settings'
import { AccountAvatar } from '@/modules/core/components/account-avatar'
import { cn } from '@repo/ui/cn'
import { ACCOUNT_NAME, ACCOUNT_PLAN } from '@/modules/core/constants/account'
import { ROUTES } from '../../constants'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'

/**
 * The account row: initials avatar, name over plan, settings on the right,
 * separated from the body by a full-bleed hairline.
 *
 * Name and plan are constants — Hermes has no identity or billing endpoint.
 * Settings is a real destination: `/settings` mounts the Account, Vault and
 * Connectors surfaces, so the button is a `NavLink` and lights up while you are
 * on any of them.
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

        {/*
          Hidden on the icon rail, as it was: the 48px rail has room for the avatar
          and nothing beside it, and the row's own `title` already names the account
          there.
        */}
        {!isCollapsed && (
          <NavLink
            to={ROUTES.SETTINGS}
            aria-label="Settings"
            className={({ isActive }) =>
              cn(
                'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary transition-all duration-200 ease-linear hover:bg-fill-secondary',
                { 'bg-fill-secondary': isActive },
              )
            }
          >
            <SettingsIcon className="size-5" />
          </NavLink>
        )}
      </div>
    </div>
  )
}
