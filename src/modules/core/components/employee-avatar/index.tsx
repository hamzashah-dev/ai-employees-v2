import type { FC } from 'react'
import { cn } from '../../utils/cn'
import { getIdentity, type MascotShape } from '../../utils/identity'

/**
 * The employee mascot.
 *
 * The canvas draws a solid identity-coloured shape carrying a two-dot `face28`
 * glyph. Shape and colour come from a hash of the profile name, since Hermes
 * stores no visual identity of any kind.
 */

interface EmployeeAvatarProps {
  profile: string
  size?: number
  className?: string
}

const SHAPE_PATHS: Record<MascotShape, string> = {
  // Rounded square-ish blob.
  blob: 'M50 4c30 0 46 16 46 46s-16 46-46 46S4 80 4 50 20 4 50 4z',
  // Teardrop.
  drop: 'M50 3c18 22 34 36 34 54a34 34 0 1 1-68 0C16 39 32 25 50 3z',
  // Soft triangle.
  triangle: 'M50 6c4 0 7 2 9 6l33 62c4 8-1 18-10 18H18c-9 0-14-10-10-18l33-62c2-4 5-6 9-6z',
  // Cloud.
  cloud: 'M28 82c-13 0-24-10-24-23 0-11 8-21 19-23C26 24 37 16 50 16c15 0 27 10 30 24 10 2 16 11 16 21 0 12-10 21-22 21z',
}

export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({
  profile,
  size = 28,
  className,
}) => {
  const { color, shape } = getIdentity(profile)
  // Eyes scale with the mascot so a 150px marketplace blob and a 28px roster
  // row read as the same character.
  const eyeR = 6
  const eyeY = 52

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={`${profile} avatar`}
    >
      <path d={SHAPE_PATHS[shape]} fill={`rgb(${color})`} />
      <ellipse cx="38" cy={eyeY} rx={eyeR * 0.62} ry={eyeR} fill="rgb(15 15 15 / 0.85)" />
      <ellipse cx="62" cy={eyeY} rx={eyeR * 0.62} ry={eyeR} fill="rgb(15 15 15 / 0.85)" />
    </svg>
  )
}
