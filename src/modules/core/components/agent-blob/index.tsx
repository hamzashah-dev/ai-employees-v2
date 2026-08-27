import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useEmployeeIdentity } from '../../hooks/use-identity'
import { BotSprite } from '../bot-avatar'

/**
 * The large mascot on a marketplace card — the canvas's `blob-a`…`blob-d`.
 *
 * Identical to `EmployeeAvatar` but for the size the caller gives it, and deliberately so:
 * the two drifting apart is exactly how a hired agent used to lose its shape on the way to
 * the sidebar, and `employee-avatar.test.tsx` fails if they do. It stays a separate name
 * because the shelf and the roster are different surfaces with different sizing habits, and
 * because every call site already knows this one.
 *
 * Baked rather than live for the same reason as `EmployeeAvatar`: a marketplace grid is
 * thirty cards, and thirty WebGL contexts is past what a browser will keep alive.
 */
interface AgentBlobProps {
  profile: string
  className?: string
}

export const AgentBlob: FC<AgentBlobProps> = ({ profile, className }) => {
  const { color, shape } = useEmployeeIdentity(profile)

  return (
    <BotSprite
      shape={shape}
      color={color}
      label={`${profile} avatar`}
      className={cn('block', className)}
    />
  )
}
