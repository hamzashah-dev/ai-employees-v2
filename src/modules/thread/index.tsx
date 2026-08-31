import type { FC } from 'react'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { Composer } from './components/composer'
import { MessageList } from './components/message-list'
import { SecretKeyCard } from './components/secret-key-card'
import { ThreadHeader } from './components/thread-header'
import { useSecretRequest } from './hooks/use-secret-request'
import { useThread } from './hooks/use-thread'

interface ThreadViewProps {
  profile: string
  panelOpen: boolean
  onTogglePanel: () => void
  /** Opens the sidebar drawer. Only shown below `desktop-sm`, where the panel is hidden. */
  onOpenSidebar?: () => void
}

/**
 * One employee's conversation.
 *
 * The transcript and the composer share one measure, and it narrows when the
 * employee panel is open — the thread reflows rather than being covered, so the
 * reading width stays comfortable instead of the text being squeezed.
 */
export const ThreadView: FC<ThreadViewProps> = ({
  profile,
  panelOpen,
  onTogglePanel,
  onOpenSidebar,
}) => {
  const { thread, connection } = useThread(profile)
  const displayName = useDisplayName(profile)
  const working = thread?.status === 'working'
  const secret = useSecretRequest(profile)

  const columnClassName = panelOpen ? 'w-[600px] max-w-[90%]' : 'w-[768px] max-w-full'

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-primary">
      <ThreadHeader
        profile={profile}
        displayName={displayName}
        panelOpen={panelOpen}
        onTogglePanel={onTogglePanel}
        onOpenSidebar={onOpenSidebar}
      />

      <MessageList
        profile={profile}
        displayName={displayName}
        messages={thread?.messages ?? []}
        approval={thread?.approval}
        working={working}
        error={thread?.error}
        columnClassName={columnClassName}
        {...(secret.request ? { secretRequestId: secret.request.requestId } : {})}
      />

      <Composer
        profile={profile}
        displayName={displayName}
        working={working}
        connection={connection}
        columnClassName={columnClassName}
        {...(secret.request
          ? {
              above: (
                <SecretKeyCard
                  label={secret.label}
                  envVar={secret.request.envVar}
                  {...(secret.request.prompt ? { help: secret.request.prompt } : {})}
                  onSubmit={(value) => void secret.submit(value)}
                  onSkip={() => void secret.skip()}
                  isSubmitting={secret.isSubmitting}
                />
              ),
            }
          : {})}
      />
    </div>
  )
}
