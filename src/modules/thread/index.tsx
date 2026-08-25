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
 * The transcript and the composer share one measure, and it narrows when the
 * employee panel is open — the thread reflows rather than being covered, so the
 * reading width stays comfortable instead of the text being squeezed.
 */
export const ThreadView: FC<ThreadViewProps> = ({ profile, panelOpen, onTogglePanel }) => {
  const { thread, connection } = useThread(profile)
  const displayName = toDisplayName(profile)
  const working = thread?.status === 'working'

  const columnClassName = panelOpen ? 'w-[600px] max-w-[90%]' : 'w-[768px] max-w-full'

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-primary">
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
        working={working}
        error={thread?.error}
        columnClassName={columnClassName}
      />

      <Composer
        profile={profile}
        displayName={displayName}
        working={working}
        connection={connection}
        columnClassName={columnClassName}
      />
    </div>
  )
}
