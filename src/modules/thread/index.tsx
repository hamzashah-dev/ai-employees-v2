import type { FC } from 'react'
import { toDisplayName } from '@/modules/core/utils/identity'
import { Composer } from './components/composer'
import { MessageList } from './components/message-list'
import { ThreadHeader } from './components/thread-header'
import { useThread } from './hooks/use-thread'

interface ThreadViewProps {
  profile: string
  panelOpen: boolean
  onTogglePanel: () => void
}

/**
 * One employee's conversation.
 *
 * The column narrows when the employee panel is open so the reading measure
 * stays comfortable instead of the text simply being squeezed.
 */
export const ThreadView: FC<ThreadViewProps> = ({ profile, panelOpen, onTogglePanel }) => {
  const { thread, connection } = useThread(profile)
  const displayName = toDisplayName(profile)

  const columnClassName = panelOpen
    ? 'max-w-[var(--spacing-thread-narrow)]'
    : 'max-w-[var(--spacing-thread)]'

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[rgb(var(--color-ink-0))]">
      <ThreadHeader
        profile={profile}
        displayName={displayName}
        panelOpen={panelOpen}
        onTogglePanel={onTogglePanel}
      />

      <MessageList
        profile={profile}
        displayName={displayName}
        messages={thread?.messages ?? []}
        approval={thread?.approval}
        error={thread?.error}
        columnClassName={columnClassName}
      />

      <div className="shrink-0 px-6 pb-6">
        <Composer
          profile={profile}
          displayName={displayName}
          working={thread?.status === 'working'}
          connection={connection}
          columnClassName={columnClassName}
        />
      </div>
    </div>
  )
}
