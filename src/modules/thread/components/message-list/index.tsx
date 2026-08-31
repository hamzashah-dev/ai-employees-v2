import { Fragment } from 'react'
import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import type { ApprovalRequest, ChatMessage } from '@/modules/core/types/chat'
import { TIME_SEPARATOR_MS } from '../../constants'
import { useStickToBottom } from '../../hooks/use-stick-to-bottom'
import { ApprovalCard } from '../approval-card'
import { EmptyState } from '../empty-state'
import { EmployeeMessage } from '../employee-message'
import { JumpToLatest } from '../jump-to-latest'
import { MessageBubble } from '../message-bubble'
import { MessageError } from '../message-error'
import { SystemEvent } from '../system-event'
import { TimeSeparator } from '../time-separator'

interface MessageListProps {
  profile: string
  displayName: string
  messages: ChatMessage[]
  approval?: ApprovalRequest
  working: boolean
  /** Thread-level failure, e.g. history could not be loaded. */
  error?: string
  columnClassName: string
  /** Id of the standing secret request, if any — see the contentKey note below. */
  secretRequestId?: string
}

export const MessageList: FC<MessageListProps> = ({
  profile,
  displayName,
  messages,
  approval,
  working,
  error,
  columnClassName,
  secretRequestId,
}) => {
  /*
   * Read here rather than passed down: the card belongs *in the transcript* —
   * "asked in the thread", not in a menu or a modal — and the agent thread is
   * parked with no timeout until it is answered, so the row has to appear
   * wherever the conversation is being read. Same shape as `ApprovalCard`
   * reaching for the store itself.
   */

  const last = messages[messages.length - 1]
  // Everything that can change the column's height: a new message, more
  // streamed text, another tool row, or the approval card appearing.
  //
  // `secretRequestId` is in here even though the secret card renders in the
  // COMPOSER, not the transcript: docking it makes the prompt box taller, which
  // shrinks this column, so the view has to re-stick to the bottom or the last
  // message ends up hidden behind the card.
  const contentKey = `${messages.length}:${last?.text.length ?? 0}:${last?.segments.length ?? 0}:${approval?.id ?? ''}:${secretRequestId ?? ''}:${error ?? ''}`

  const { scrollRef, atBottom, scrollToBottom } = useStickToBottom<HTMLDivElement>(
    contentKey,
    profile,
  )

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} className="scrollbar-minimal h-full overflow-y-auto px-6">
        <section
          aria-label={`Conversation with ${displayName}`}
          className={cn('mx-auto flex flex-col gap-5 pt-6', columnClassName)}
        >
          {messages.length === 0 && !error ? (
            <EmptyState profile={profile} displayName={displayName} />
          ) : (
            messages.map((message, index) => {
              const previous = messages[index - 1]
              const separated =
                !previous || message.createdAt - previous.createdAt > TIME_SEPARATOR_MS

              return (
                <Fragment key={message.id}>
                  {separated && <TimeSeparator at={message.createdAt} />}
                  {message.role === 'system' ? (
                    <SystemEvent text={message.text} />
                  ) : message.role === 'user' ? (
                    <MessageBubble message={message} />
                  ) : (
                    <EmployeeMessage message={message} />
                  )}
                </Fragment>
              )
            })
          )}

          {approval && (
            <ApprovalCard profile={profile} approval={approval} working={working} />
          )}
          {error && <MessageError text={error} />}
        </section>
      </div>

      {!atBottom && <JumpToLatest onClick={scrollToBottom} />}
    </div>
  )
}
