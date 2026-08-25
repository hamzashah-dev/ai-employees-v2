import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ACCOUNT_NAME } from '@/modules/core/constants/account'
import { Composer } from '../../components/composer'
import { useChatHome } from './hooks/use-chat-home'

/**
 * D1 — the chat home.
 *
 * Its job in this app is to be the one place the *default* sidebar is reachable, so the
 * Employees row can be seen in its real context and the mode swap exercised end to end.
 * Every other mounted route sits under an Employees root.
 */
export const ChatHomeView: FC = () => {
  const { target, displayName, connection, working, isPending, isError } = useChatHome()

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 px-6 pb-16">
      <h1 className="text-center text-heading-sm font-medium text-primary">
        Hi {ACCOUNT_NAME}, what should we get done today?
      </h1>

      {target ? (
        <Composer
          profile={target}
          displayName={displayName}
          working={working}
          connection={connection}
          columnClassName="w-[768px] max-w-full"
          placeholder="Ask anything"
        />
      ) : (
        <p className="text-center text-label-md text-tertiary">
          {isPending
            ? 'Loading your team…'
            : isError
              ? 'Could not reach Hermes, so there is nobody to message yet.'
              : null}
          {!isPending && !isError && (
            <>
              Nobody is hired yet.{' '}
              <Link to="/marketplace" className="text-brand hover:underline">
                Hire your first employee
              </Link>{' '}
              to start a conversation.
            </>
          )}
        </p>
      )}
    </div>
  )
}
