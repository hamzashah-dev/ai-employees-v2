import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { getIdentity } from '../../utils/identity'

/**
 * An employee, wherever they appear in a list, thread, card or header.
 *
 * The canvas draws a plain identity-coloured circle carrying its `face28` glyph — two soft
 * dots on a 28-unit grid. Rendered at 28 regardless of display size and scaled by CSS, so a
 * 24px thread-header avatar and a 40px dashboard-card avatar read as the same character.
 */
interface EmployeeAvatarProps {
  profile: string
  className?: string
}

export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({ profile, className }) => {
  const { color } = getIdentity(profile)

  return (
    <span
      role="img"
      aria-label={`${profile} avatar`}
      style={{ backgroundColor: color }}
      className={cn('relative block size-7 shrink-0 rounded-full', className)}
    >
      <svg viewBox="0 0 28 28" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="10.6" cy="13.4" r="1.7" fill="rgb(0 0 0 / 0.38)" />
        <circle cx="17.4" cy="13.4" r="1.7" fill="rgb(0 0 0 / 0.38)" />
      </svg>
    </span>
  )
}
