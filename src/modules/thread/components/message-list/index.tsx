import { Fragment } from 'react'
import type { FC } from 'react'
import type { ApprovalRequest, ChatMessage } from '@/modules/core/types/chat'
import { cn } from '@/modules/core/utils/cn'
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
  /** Thread-level failure, e.g. history could not be loaded. */
  error?: string
  columnClassName: string
}

export const MessageList: FC<MessageListProps> = ({
  profile,
  displayName,
  messages,
  approval,
  error,
  columnClassName,
}) => {
  const last = messages[messages.length - 1]
  // Everything that can change the column's height: a new message, more
  // streamed text, another tool row, the approval card appearing.
  const contentKey = `${messages.length}:${last?.text.length ?? 0}:${last?.tools?.length ?? 0}:${approval?.id ?? ''}:${error ?? ''}`

  const { scrollRef, atBottom, scrollToBottom } = useStickToBottom<HTMLDivElement>(
    contentKey,
    profile,
  )

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} className="scrollbar-subtle h-full overflow-y-auto">
        <section
          aria-label={`Conversation with ${displayName}`}
          className={cn('mx-auto flex w-full flex-col gap-6 px-6 py-8', columnClassName)}
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

          {approval && <ApprovalCard profile={profile} approval={approval} />}
          {error && <MessageError text={error} />}
        </section>
      </div>

      {!atBottom && <JumpToLatest onClick={scrollToBottom} />}
    </div>
  )
}
