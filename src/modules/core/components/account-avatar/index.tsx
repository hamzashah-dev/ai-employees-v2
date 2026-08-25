import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { ACCOUNT_NAME } from '../../constants/account'

/**
 * The signed-in user's initials.
 *
 * Hermes exposes no user-identity endpoint, so the name comes from the shared core
 * constant. The canvas draws this at three sizes — 28px in the top bar and thread header,
 * 40px in the sidebar footer — so the size is a `className` override rather than a variant.
 */
interface AccountAvatarProps {
  className?: string
}

/** "Imagine User" -> "IU", "Muzammil" -> "M". */
const toInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase() || '?'

export const AccountAvatar: FC<AccountAvatarProps> = ({ className }) => (
  <span
    aria-label={ACCOUNT_NAME}
    role="img"
    className={cn(
      'flex size-7 shrink-0 items-center justify-center rounded-full',
      'border border-primary bg-fill-tertiary',
      'text-label-sm font-medium text-primary',
      className,
    )}
  >
    {toInitials(ACCOUNT_NAME)}
  </span>
)
