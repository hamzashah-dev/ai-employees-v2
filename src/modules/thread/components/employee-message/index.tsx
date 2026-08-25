import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import type { ChatMessage } from '@/modules/core/types/chat'
import { MessageError } from '../message-error'
import { ToolCalls } from '../tool-calls'
import { MarkdownBody } from './components/markdown-body'

/**
 * The employee speaks plainly: no bubble, no background, no avatar gutter —
 * just text on the page. Only the user gets a bubble, and that asymmetry is
 * what makes a thread read as a person answering rather than two chat clients
 * talking past each other.
 */

/**
 * The caret has to sit at the end of the *text*, and the last thing markdown
 * renders is a block element — a sibling span would drop to its own line. So it
 * is drawn on the last block's `::after`, which lands inline after the final
 * word wherever that word happens to be.
 */
const STREAMING_CARET =
  '[&>:last-child]:after:ml-1 [&>:last-child]:after:inline-block [&>:last-child]:after:h-[1em] ' +
  '[&>:last-child]:after:w-[2px] [&>:last-child]:after:animate-pulse ' +
  '[&>:last-child]:after:bg-fill-inverse [&>:last-child]:after:align-[-0.15em] ' +
  "[&>:last-child]:after:content-['']"

interface EmployeeMessageProps {
  message: ChatMessage
}

export const EmployeeMessage: FC<EmployeeMessageProps> = ({ message }) => {
  const tools = message.tools ?? []

  return (
    <div className="flex w-full max-w-[640px] flex-col gap-3">
      {message.text ? (
        <MarkdownBody
          text={message.text}
          className={cn({ [STREAMING_CARET]: message.streaming })}
        />
      ) : (
        message.streaming && (
          // Nothing has arrived yet — the caret is the whole message.
          <span
            className="inline-block h-[1em] w-[2px] animate-pulse bg-fill-inverse"
            aria-hidden
          />
        )
      )}

      {tools.length > 0 && <ToolCalls tools={tools} />}
      {message.error && <MessageError text={message.error} />}
    </div>
  )
}
