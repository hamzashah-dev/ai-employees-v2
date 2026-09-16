import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStartSession } from '@/modules/core/hooks/use-start-session'
import { useSessionRows } from '@/modules/core/hooks/use-session-rows'
import { ROUTES, sessionPath } from '@/modules/roster/constants'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { Composer } from './components/composer'
import { MessageList } from './components/message-list'
import { SecretKeyCard } from './components/secret-key-card'
import { ThreadHeader } from './components/thread-header'
import { useSecretRequest } from './hooks/use-secret-request'
import { useThread } from './hooks/use-thread'
import type { ThreadRef } from '@/modules/core/services/hermes/session-manager'

interface ThreadViewProps {
  threadRef: ThreadRef
  panelOpen: boolean
  onTogglePanel: () => void
  /** Opens the panel if it is closed. The header's identity button is the caller. */
  onOpenPanel: () => void
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
  threadRef,
  panelOpen,
  onTogglePanel,
  onOpenPanel,
  onOpenSidebar,
}) => {
  const { thread, connection } = useThread(threadRef)
  const navigate = useNavigate()
  const startSession = useStartSession(threadRef.profile)
  const [startingSession, setStartingSession] = useState(false)
  /*
   * The title comes from the session list rather than the socket: Hermes titles
   * a session with an LLM after the fact, and no gateway event carries it. The
   * header falls back to a neutral label until that list has loaded, rather
   * than inventing a name from the first message.
   */
  const { rows } = useSessionRows(threadRef.profile)
  const sessionTitle =
    rows.find((row) => row.id === threadRef.sessionId)?.title?.trim() ?? ''

  const openSessions = (): void => {
    navigate(`${ROUTES.EMPLOYEES}/${encodeURIComponent(threadRef.profile)}`)
  }

  const newSession = (): void => {
    setStartingSession(true)
    void startSession()
      .then((ref) => {
        navigate(sessionPath(ref.profile, ref.sessionId))
      })
      .finally(() => setStartingSession(false))
  }
  const displayName = useDisplayName(threadRef.profile)
  const working = thread?.status === 'working'
  const secret = useSecretRequest(threadRef)

  const columnClassName = panelOpen ? 'w-[600px] max-w-[90%]' : 'w-[768px] max-w-full'

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-primary">
      <ThreadHeader
        profile={threadRef.profile}
        displayName={displayName}
        sessionTitle={sessionTitle}
        onOpenSessions={openSessions}
        onNewSession={newSession}
        startingSession={startingSession}
        panelOpen={panelOpen}
        onTogglePanel={onTogglePanel}
        onOpenPanel={onOpenPanel}
        onOpenSidebar={onOpenSidebar}
      />

      <MessageList
        thread={threadRef}
        displayName={displayName}
        messages={thread?.messages ?? []}
        approval={thread?.approval}
        working={working}
        error={thread?.error}
        columnClassName={columnClassName}
        {...(secret.request ? { secretRequestId: secret.request.requestId } : {})}
      />

      <Composer
        // The design names the session rather than the employee here: you are
        // replying inside one conversation, not messaging a person in general.
        placeholder="Reply in this session"
        thread={threadRef}
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
