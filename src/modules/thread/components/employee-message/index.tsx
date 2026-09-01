import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { ThinkingPhrase } from '@/modules/core/components/thinking-phrase'
import { ThinkingStatusRow } from '@/modules/core/components/thinking-status-row'
import type { ChatMessage } from '@/modules/core/types/chat'
import { MessageError } from '../message-error'
import { ThinkingTrail } from '../thinking-trail'
import { MarkdownBody } from '@/modules/core/components/markdown-body'
import { buildTimeline } from './utils/build-timeline'

/**
 * The employee speaks plainly: no bubble, no background, no avatar gutter —
 * just text on the page. Only the user gets a bubble, and that asymmetry is
 * what makes a thread read as a person answering rather than two chat clients
 * talking past each other.
 *
 * The message is a chronology, not a body with a footer: reasoning, tool work and prose
 * render in the order they happened, because the model narrates, works, and narrates again.
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
  const blocks = buildTimeline(message)
  const lastIndex = blocks.length - 1
  const tail = blocks[lastIndex]

  // Nothing has arrived at all yet. Upstream shows no skeleton here — a rotating phrase beside
  // the live dot, and that is the whole pending state.
  if (blocks.length === 0 && message.streaming) {
    return (
      <div className="flex w-full max-w-[640px] flex-col gap-3">
        <ThinkingStatusRow status="active" label={<ThinkingPhrase />} />
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-[640px] flex-col">
      {blocks.map((block, index) =>
        block.kind === 'group' ? (
          <ThinkingTrail
            key={block.id}
            messageId={message.id}
            group={block}
            isActive={!!message.streaming && index === lastIndex}
            isFirst={index === 0}
          />
        ) : (
          <MarkdownBody
            key={block.id}
            text={block.text}
            className={cn({
              [STREAMING_CARET]: message.streaming && index === lastIndex,
            })}
          />
        ),
      )}

      {/* The turn is still open but the tail is prose or a card, so the trail's own footer
          is not on screen to carry the live signal. */}
      {message.streaming && tail?.kind === 'text' && (
        <ThinkingStatusRow status="active" label="Writing response" className="mt-3" />
      )}

      {message.error && <MessageError text={message.error} className="mt-3" />}
    </div>
  )
}
