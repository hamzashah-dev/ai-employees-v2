import type { FC } from 'react'
import { SettingsIcon } from '@/modules/core/components/icon'
import { ACCOUNT_NAME, ACCOUNT_PLAN } from '../../constants'

/** Initials for the account avatar: "Imagine User" -> "IU". */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

/**
 * The account row, matching chatly's footer: circular initials avatar, name
 * over plan, and a settings control on the right. Separated from the list by a
 * full-bleed hairline.
 */
export const SidebarFooter: FC = () => (
  <div className="border-t border-[rgb(var(--color-border-subtle))] p-2">
    <div className="flex h-12 items-center gap-2 rounded-xl px-1">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-fill-secondary))] text-label-sm font-medium text-[rgb(var(--color-content-secondary))]">
        {initials(ACCOUNT_NAME)}
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-label-md text-[rgb(var(--color-content-primary))]">
          {ACCOUNT_NAME}
        </span>
        <span className="truncate text-label-sm text-[rgb(var(--color-content-primary)/0.5)]">
          {ACCOUNT_PLAN}
        </span>
      </span>

      <button
        type="button"
        aria-label="Settings"
        title="Settings are not available yet"
        disabled
        className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-xl text-[rgb(var(--color-content-primary)/0.5)] transition-colors hover:bg-[rgb(var(--color-fill-secondary))] disabled:pointer-events-none disabled:opacity-40"
      >
        <SettingsIcon className="size-4 stroke-[1.2px]" />
      </button>
    </div>
  </div>
)
