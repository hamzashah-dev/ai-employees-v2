import type { FC } from 'react'
import { SettingsIcon } from '@repo/icons/settings'
import { toInitials } from '@/modules/core/utils/identity'
import { ACCOUNT_NAME, ACCOUNT_PLAN } from '../../constants'

/**
 * The account row: initials avatar, name over plan, settings on the right,
 * separated from the body by a full-bleed hairline.
 *
 * Name and plan are constants — Hermes has no identity or billing endpoint.
 * Settings is disabled for the same reason: there is nothing behind it yet.
 */
export const SidebarFooter: FC = () => (
  <div className="shrink-0 border-t border-primary p-3">
    <div className="flex items-center gap-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary bg-fill-tertiary text-label-md font-medium text-primary">
        {toInitials(ACCOUNT_NAME)}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-label-md text-primary">{ACCOUNT_NAME}</span>
        <span className="truncate text-label-xs text-tertiary">{ACCOUNT_PLAN}</span>
      </span>

      <button
        type="button"
        aria-label="Settings"
        title="Settings are not available yet"
        disabled
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary transition-all duration-200 ease-linear hover:bg-fill-secondary disabled:pointer-events-none disabled:opacity-60"
      >
        <SettingsIcon className="size-5" />
      </button>
    </div>
  </div>
)
