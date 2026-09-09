import type { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeftIcon } from '@repo/icons/chevron-left'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import { useSessionDetail } from '../../hooks/use-session-detail'

/**
 * §s35 — one session's transcript, read-only.
 *
 * The canvas draws a live composer ("Reply in this session") and a title
 * dropdown for switching sessions mid-view. Both are left out here for the
 * same reason as the list's composer: replying to a session is the live
 * gateway's job (`prompt.submit` against an open socket, resumed through
 * `SessionManager`), which is what the one-on-one thread already does at
 * `/employees/:profile`. This page reads history over REST
 * (`GET /api/sessions/:id/messages`) — a plain, unauthenticated-for-writes
 * fetch — and has no session of its own to submit into. Making "Reply" work
 * here would mean either faking it or quietly resuming the profile's live
 * session out from under the thread view, which could fork what the user
 * sees in two places. A "Back to sessions" link stands in for both absent
 * controls.
 */
export const SessionDetailView: FC = () => {
  const { profile, sessionId } = useParams<{ profile: string; sessionId: string }>()
  const navigate = useNavigate()
  const { messages, isLoading, error } = useSessionDetail(sessionId ?? '', profile ?? '')

  if (!profile || !sessionId) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <button
          type="button"
          onClick={() => navigate(`/employees/${encodeURIComponent(profile)}/sessions`)}
          className="flex items-center gap-1 rounded-xl px-1.5 py-1 text-label-md text-secondary hover:bg-fill-variant-hover hover:text-primary"
        >
          <ChevronLeftIcon className="size-4" />
          Sessions
        </button>
      </header>

      <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-6">
        <div className="mx-auto flex max-w-[720px] flex-col gap-5 py-6">
          {isLoading && (
            <div className="flex items-center gap-2 py-6 text-label-md text-tertiary">
              <Spinner />
              Loading transcript…
            </div>
          )}

          {!isLoading && error && (
            <p className="py-6 text-label-md text-critical">Could not load this session.</p>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <p className="py-6 text-label-md text-tertiary">This session has no messages.</p>
          )}

          {!isLoading &&
            !error &&
            messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl bg-fill-elevated px-4 py-2.5 text-label-lg whitespace-pre-wrap text-primary">
                    {message.text}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="flex gap-3">
                  <EmployeeAvatar profile={profile} size={28} />
                  <p className="max-w-[80%] flex-1 text-label-lg whitespace-pre-wrap text-primary">
                    {message.text}
                  </p>
                </div>
              ),
            )}
        </div>
      </div>
    </div>
  )
}
