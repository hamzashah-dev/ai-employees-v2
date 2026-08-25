import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { MASCOT_EYES, MASCOT_PATHS } from '../../constants/identity'
import { getIdentity } from '../../utils/identity'

/**
 * The large organic mascot on a marketplace card — the canvas's `blob-a`…`blob-d`.
 *
 * A different treatment of the same identity as EmployeeAvatar, not a bigger version of it:
 * the shelf wants character, a roster row wants a legible dot. Shape and colour both come
 * from the profile-name hash, so a card and its roster row stay recognisably the same agent.
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
