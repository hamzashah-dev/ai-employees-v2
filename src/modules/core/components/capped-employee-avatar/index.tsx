import type { FC } from 'react'
import { useEmployeeIdentity } from '../../hooks/use-identity'
import { CappedMark } from '../bot-avatar/capped-mark'

/**
 * An employee, capped — the sidebar's avatar.
 *
 * `EmployeeAvatar`'s counterpart: it resolves the same profile's hue, seed and job prop
 * through `useEmployeeIdentity` and hands them to `CappedMark` instead of a bare `BotMark`.
 * Deliberately a second component rather than a mode on `EmployeeAvatar` itself — the capped
 * look is round-only and is rolling out one surface at a time (the sidebar first), so the two
 * entry points stay independent until every surface has moved and `EmployeeAvatar` can be
 * retired in its favour. `shape` from identity is read nowhere here on purpose: `CappedMark`
 * always draws round, regardless of what an employee would otherwise hash to.
 */
interface CappedEmployeeAvatarProps {
  profile: string
  /** Rendered size in CSS pixels — the box and the cap/glyph laid over it. */
  size?: number
  /** True while this employee has a turn in flight, which switches it to the working face. */
  busy?: boolean
  className?: string
}

export const CappedEmployeeAvatar: FC<CappedEmployeeAvatarProps> = ({
  profile,
  size = 36,
  busy = false,
  className,
}) => {
  const { color, seed, prop } = useEmployeeIdentity(profile)

  return (
    <CappedMark
      color={color}
      seed={seed}
      prop={prop}
      size={size}
      busy={busy}
      label={`${profile} avatar`}
      className={className}
    />
  )
}
