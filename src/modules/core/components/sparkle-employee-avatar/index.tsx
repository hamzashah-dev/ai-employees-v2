import type { FC } from 'react'
import { useEmployeeIdentity } from '../../hooks/use-identity'
import { SparkleMark } from '../bot-avatar/sparkle-mark'

/**
 * An employee, sparkle-style — the sidebar's avatar.
 *
 * `EmployeeAvatar`'s and `CappedEmployeeAvatar`'s counterpart: resolves the profile's seed
 * through `useEmployeeIdentity` and hands it to `SparkleMark`. Colour, shape and job prop from
 * identity are read nowhere here on purpose — `SparkleMark` has its own closed three-variant
 * vocabulary, indexed by the same seed, not identity's eight-hue/nine-shape one.
 */
interface SparkleEmployeeAvatarProps {
  profile: string
  /** Rendered size in CSS pixels — the box and the blob/eyes drawn over it. */
  size?: number
  className?: string
}

export const SparkleEmployeeAvatar: FC<SparkleEmployeeAvatarProps> = ({
  profile,
  size = 36,
  className,
}) => {
  const { seed } = useEmployeeIdentity(profile)

  return (
    <SparkleMark seed={seed} size={size} label={`${profile} avatar`} className={className} />
  )
}
