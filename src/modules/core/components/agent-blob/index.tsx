import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { MASCOT_EYES, MASCOT_PATHS } from '../../constants/identity'
import { getIdentity } from '../../utils/identity'

/**
 * The large organic mascot on a marketplace card — the canvas's `blob-a`…`blob-d`.
 *
 * The hero treatment of the same identity `EmployeeAvatar` draws everywhere else: same
 * `getIdentity(profile)`, same `MASCOT_PATHS` silhouette, same `MASCOT_EYES`. The only
 * difference is the eye radius, which the small treatment has to fatten to survive a 28px
 * box. Keep it that way — the two drifting apart is exactly how a hired agent used to lose
 * its shape on the way to the sidebar, and `employee-avatar.test.tsx` now fails if they do.
 */
interface AgentBlobProps {
  profile: string
  className?: string
}

export const AgentBlob: FC<AgentBlobProps> = ({ profile, className }) => {
  const { color, shape } = getIdentity(profile)
  const eyes = MASCOT_EYES[shape]

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('block', className)}
      role="img"
      aria-label={`${profile} avatar`}
    >
      <path d={MASCOT_PATHS[shape]} fill={color} />
      <circle cx={eyes.left} cy={eyes.y} r="5" fill="rgb(0 0 0 / 0.4)" />
      <circle cx={eyes.right} cy={eyes.y} r="5" fill="rgb(0 0 0 / 0.4)" />
    </svg>
  )
}
