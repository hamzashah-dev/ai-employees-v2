import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { Spinner } from '@/modules/core/components/spinner'
import { getSessionToken, isGatedAuthMode } from '@/modules/core/services/hermes/config'

/**
 * Connection state, surfaced rather than swallowed.
 *
 * A chat UI whose socket has quietly died looks identical to one where the
 * agent is simply thinking, so silence here is the worst option. Says nothing
 * while the socket is healthy.
 */
export const ConnectionBanner: FC = () => {
  const connection = useChatStore((s) => s.connection)
  const detail = useChatStore((s) => s.connectionDetail)

  if (connection === 'open') return null

  // A missing token is the single most common local failure, and the generic
  // "closed" message sends people looking in the wrong place.
  if (!getSessionToken()) {
    return (
      <Banner tone="danger">
        {isGatedAuthMode()
          ? 'This dashboard requires sign-in, which this app does not support yet.'
          : 'No dashboard session token. Start `computer dashboard`, then reload.'}
      </Banner>
    )
  }

  if (connection === 'connecting') {
    return (
      <Banner tone="muted">
        <Spinner /> Connecting to Hermes…
      </Banner>
    )
  }

  if (connection === 'reconnecting') {
    return (
      <Banner tone="warning">
        <Spinner /> Reconnecting… {detail}
      </Banner>
    )
  }

  return <Banner tone="danger">Disconnected. {detail ?? 'The dashboard may have stopped.'}</Banner>
}

const TONES = {
  muted: 'bg-fill-elevated text-secondary',
  warning: 'bg-surface-warning text-warning',
  danger: 'bg-surface-critical text-critical',
} as const

const Banner: FC<{ tone: keyof typeof TONES; children: React.ReactNode }> = ({
  tone,
  children,
}) => (
  <div
    role="status"
    className={cn(
      'flex items-center justify-center gap-2 px-4 py-1.5 text-label-sm',
      TONES[tone],
    )}
  >
    {children}
  </div>
)
