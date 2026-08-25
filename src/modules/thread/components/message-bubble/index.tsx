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
 *
 * The canvas caps the bubble at a flat 75%, which says nothing about a narrow
 * viewport — so the shipped chat's responsive caps are used instead.
 */
export const MessageBubble: FC<MessageBubbleProps> = ({ message }) => (
  <div className="flex flex-col items-end gap-1.5">
    <div className="max-w-[256px] self-end rounded-[20px] bg-fill-elevated px-4 py-2.5 text-body-md break-words whitespace-pre-wrap text-primary tablet:max-w-[364px] laptop:max-w-[512px]">
      {message.text}
    </div>
    {message.error && <MessageError text={message.error} className="max-w-[512px]" />}
  </div>
)
