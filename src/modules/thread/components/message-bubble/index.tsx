import type { FC } from 'react'
import type { ChatMessage } from '@/modules/core/types/chat'
import { MessageError } from '../message-error'

interface MessageBubbleProps {
  message: ChatMessage
}

/**
 * The user's own words, in the only bubble in the thread.
 *
 * Rendered as plain text on purpose: what someone typed should appear exactly
 * as they typed it, and running their asterisks and underscores through a
 * markdown parser would silently rewrite it.
 */
export const MessageBubble: FC<MessageBubbleProps> = ({ message }) => (
  <div className="flex flex-col items-end gap-1.5">
    <div className="max-w-[520px] rounded-[20px] bg-[rgb(var(--color-ink-2))] px-4 py-3 text-body break-words whitespace-pre-wrap text-[rgb(var(--color-ink-7))]">
      {message.text}
    </div>
    {message.error && <MessageError text={message.error} className="max-w-[520px]" />}
  </div>
)
