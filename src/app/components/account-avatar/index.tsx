import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { ACCOUNT_NAME } from '@/modules/core/constants/account'

/**
 * The signed-in user's initials.
 *
 * Hermes exposes no user-identity endpoint, so the name comes from the shared core constant the
 * sidebar footer also reads — one source of truth until there is a real one.
 */
interface AccountAvatarProps {
  className?: string
}

/** "Imagine User" -> "IU", "Muzammil" -> "M". */
const toInitial = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 1)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase() || '?'

export const AccountAvatar: FC<AccountAvatarProps> = ({ className }) => (
  <span
    aria-hidden
    className={cn(
      'flex size-7 shrink-0 items-center justify-center rounded-full',
      'border border-primary bg-fill-variant-active',
      'text-label-sm font-medium text-primary',
      className,
    )}
  >
    {toInitial(ACCOUNT_NAME)}
  </span>
)
