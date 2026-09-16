import type { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import { useChatStore, selectEmployeeStatus } from '@/modules/core/stores/chat-store'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'
import { useStartSession } from '@/modules/core/hooks/use-start-session'
import { sessionPath } from '@/modules/roster/constants'
import { Composer } from '@/modules/thread/components/composer'
import { SessionRow } from './components/session-row'
import { useEmployeeSessions } from './hooks/use-employee-sessions'

/**
 * An employee's home: every conversation they are holding, and a way to start
 * another.
 *
 * This is the employee's own route rather than a chat, because an employee has
 * many conversations and landing in one of them would quietly hide the rest —
 * which is exactly what this app did while a profile had a single thread.
 *
 * The composer creates nothing until the user actually sends. `session.create`
 * writes a row immediately, so opening an employee would otherwise leave an
 * empty session in this very list every time anyone looked at them.
 */
export const SessionsListView: FC = () => {
  const { profile } = useParams<{ profile: string }>()
  const navigate = useNavigate()
  const connection = useChatStore((state) => state.connection)
  const status = useChatStore((state) => selectEmployeeStatus(state, profile ?? ''))

  const employee = useEmployeeProfile(profile ?? '')
  const { groups, isLoading, error } = useEmployeeSessions(profile ?? '')
  const startSession = useStartSession(profile ?? '')

  if (!profile) return null

  const displayName = employee.data?.name ?? profile
  const description = employee.data?.description?.trim()

  const startThread = async (): Promise<{ profile: string; sessionId: string }> => {
    const ref = await startSession()
    navigate(sessionPath(ref.profile, ref.sessionId))
    return ref
  }

  return (
    <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <EmployeeAvatar profile={profile} size={28} />
            <h1 className="truncate text-heading-xs text-primary">{displayName}</h1>
          </div>
          {description && <p className="text-label-md text-secondary">{description}</p>}
        </div>

        <Composer
          startThread={startThread}
          displayName={displayName}
          working={status === 'working'}
          connection={connection}
          columnClassName="w-full"
          placeholder={`Start a new session with ${displayName}`}
        />

        {isLoading && (
          <div className="flex items-center gap-2 py-6 text-label-md text-tertiary">
            <Spinner />
            Loading sessions…
          </div>
        )}

        {error && (
          <p className="py-6 text-label-md text-critical">
            Could not read {displayName}’s sessions. {error.message}
          </p>
        )}

        {!isLoading && !error && groups.length === 0 && (
          <p className="py-6 text-label-md text-tertiary">
            No sessions yet. The first message you send starts one.
          </p>
        )}

        {groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-1">
            <h2 className="px-3 py-1 text-label-xs uppercase text-tertiary">{group.label}</h2>
            <ul className="flex flex-col">
              {group.sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  title={session.title}
                  timeLabel={session.timeLabel}
                  unread={session.unread}
                  isActive={session.isActive}
                  onOpen={() => navigate(sessionPath(profile, session.id))}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
