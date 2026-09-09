import type { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'
import { describeEmployeeState } from '@/modules/core/utils/employee-state'
import { Spinner } from '@/modules/core/components/spinner'
import { SessionRow } from './components/session-row'
import { useEmployeeSessions } from './hooks/use-employee-sessions'

/**
 * §s34 — one employee's session history.
 *
 * The canvas draws two things this port will not fake. First, per-row
 * "Working now" / "Allow" / "Review" — `HermesSessionRow` (the type
 * `GET /api/sessions` actually answers with) carries a title, a preview, a
 * message count and three timestamps, and nothing that says "awaiting your
 * approval" or "currently mid-turn". The only live status Hermes gives this
 * app is `chat-store`'s per-*profile* signal off the gateway socket
 * (`session.info`'s `running`), which this page renders once, honestly, in
 * the header — not stamped onto whichever historical row happens to be
 * newest. Second, the composer at the top of the canvas ("Start a new
 * session with…") is left out: starting a session is the one-on-one thread's
 * job (`modules/thread`, mounted at `/employees/:profile`), and duplicating
 * it here would give this app two different code paths that both create a
 * session for the same profile.
 */
export const SessionsListView: FC = () => {
  const { profile } = useParams<{ profile: string }>()
  const navigate = useNavigate()
  const connection = useChatStore((state) => state.connection)

  const status = useChatStore((state) => (profile ? state.threads[profile]?.status : undefined))
  const employee = useEmployeeProfile(profile ?? '')
  const { groups, isLoading, error } = useEmployeeSessions(profile ?? '')

  if (!profile) return null

  const state = describeEmployeeState(status, connection)
  const displayName = employee.data?.name ?? profile

  return (
    <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 py-8">
        <div className="flex items-center gap-3">
          <EmployeeAvatar profile={profile} size={40} />
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-heading-xs text-primary">{displayName}</p>
            <span className="flex items-center gap-1.5 text-label-sm text-tertiary">
              <span
                className={cn('size-1.5 shrink-0 rounded-full bg-current', {
                  'text-success': state.tone === 'success',
                  'text-warning': state.tone === 'warning',
                  'text-critical': state.tone === 'critical',
                  'text-tertiary': state.tone === 'neutral',
                })}
              />
              {state.label}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 py-6 text-label-md text-tertiary">
            <Spinner />
            Loading sessions…
          </div>
        )}

        {!isLoading && error && (
          <p className="py-6 text-label-md text-critical">Could not load this employee&rsquo;s sessions.</p>
        )}

        {!isLoading && !error && groups.length === 0 && (
          <p className="py-6 text-label-md text-tertiary">No sessions yet.</p>
        )}

        {!isLoading &&
          !error &&
          groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 text-label-xs font-medium tracking-wide text-tertiary uppercase">
                {group.label}
              </p>
              <ul className="flex flex-col">
                {group.sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    title={session.title}
                    preview={session.preview}
                    timeLabel={session.timeLabel}
                    onOpen={() =>
                      navigate(
                        `/employees/${encodeURIComponent(profile)}/sessions/${encodeURIComponent(session.id)}`,
                      )
                    }
                  />
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  )
}
