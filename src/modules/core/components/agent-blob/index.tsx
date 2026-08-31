import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useEmployeeIdentity } from '../../hooks/use-identity'
import { BotMark } from '../bot-avatar'

/**
 * The large mascot on a marketplace card — the canvas's `blob-a`…`blob-d`.
 *
 * Identical to `EmployeeAvatar` but for the size the caller gives it, and deliberately so:
 * the two drifting apart is exactly how a hired agent used to lose its shape on the way to
 * the sidebar, and `employee-avatar.test.tsx` fails if they do. It stays a separate name
 * because the shelf and the roster are different surfaces with different sizing habits, and
 * because every call site already knows this one.
 *
 * Flat SVG like every other avatar. It was a baked sprite when the mascot was a 3D render,
 * because a marketplace grid is thirty cards and thirty WebGL contexts is past what a browser
 * keeps alive; there is no context to spend now, so there is nothing to bake.
 */
interface AgentBlobProps {
  profile: string
  /**
   * Rendered size in CSS pixels, and the input to the mark's detail tiers. Defaults to the
   * shelf card's own 64 rather than the roster's 36 — a card is the one surface with room for
   * the ground shadow, and the tiers only draw it at 48 and up.
   */
  size?: number
  className?: string
}

export const AgentBlob: FC<AgentBlobProps> = ({ profile, size = 64, className }) => {
  const { color, shape, prop } = useEmployeeIdentity(profile)

  return (
    <BotMark
      shape={shape}
      color={color}
      prop={prop}
      size={size}
      label={`${profile} avatar`}
      className={cn('block', className)}
    />
  )
}
