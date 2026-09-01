import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { ThinkingDisclosure } from '@/modules/core/components/thinking-disclosure'
import { ThinkingPhrase } from '@/modules/core/components/thinking-phrase'
import { ThinkingStatusRow } from '@/modules/core/components/thinking-status-row'
import { ThinkingTrailItem } from '@/modules/core/components/thinking-trail-item'
import { MarkdownBody } from '@/modules/core/components/markdown-body'
import type { TimelineGroup } from '../employee-message/utils/build-timeline'
import { buildTrailEntries } from '../employee-message/utils/build-timeline'
import { ReasoningIcon, getToolIcon } from './utils'

interface ThinkingTrailProps {
  messageId: string
  group: TimelineGroup
  /** True only for the group at the tail of a still-streaming turn. */
  isActive: boolean
  /** Drops the leading gap when this group opens the message. */
  isFirst: boolean
}

/**
 * One contiguous run of reasoning and tool work, as a collapsed trail.
 *
 * It stays **closed even while streaming** — that is upstream's behaviour, not an oversight.
 * The live signal is the shimmering header plus a status row that `ThinkingDisclosure` renders
 * outside the collapsible body, so it is still visible when folded. Someone who wants the
 * detail opens it; everyone else gets one quiet line instead of ten.
 */
export const ThinkingTrail: FC<ThinkingTrailProps> = ({
  messageId,
  group,
  isActive,
  isFirst,
}) => {
  const entries = buildTrailEntries(group.toolCalls)
  const hasReasoning = group.thinkingBlocks.length > 0

  // Reasoning leads until the first tool step lands, then it stops being the live thing.
  const isReasoningActive = isActive && entries.length === 0

  const runningEntry = [...entries].reverse().find((entry) => entry.isRunning)
  const anyFailed = entries.some((entry) => entry.failed)

  return (
    <div className={cn('mb-3', { 'mt-3': !isFirst })}>
      <ThinkingDisclosure
        value={`thinking-${messageId}-${group.id}`}
        label={isActive ? 'Working...' : 'Done'}
        isActive={isActive}
        renderFooter={
          isActive
            ? (isOpen) => (
                <ThinkingStatusRow
                  status="active"
                  // The specific step if there is one, else a rotating phrase — echoing the
                  // static header here would just say "Working" twice.
                  label={runningEntry?.title ?? <ThinkingPhrase />}
                  connectTop={isOpen}
                  className={cn({ 'mt-2': isOpen })}
                />
              )
            : undefined
        }
      >
        {hasReasoning && (
          <ThinkingTrailItem
            value={`reasoning-${messageId}-${group.id}`}
            marker={<ReasoningIcon className="size-3.5 stroke-[1.5]" />}
            label="Thinking"
            isActive={isReasoningActive}
          >
            <div className="flex flex-col gap-3 text-body-sm text-tertiary">
              {group.thinkingBlocks.map((block) => (
                <MarkdownBody key={block.id} text={block.text} className="text-body-sm" />
              ))}
            </div>
          </ThinkingTrailItem>
        )}

        {entries.map((entry, index) => {
          const Icon = getToolIcon(entry.name)

          return (
            <ThinkingTrailItem
              key={entry.id}
              value={`tool-${messageId}-${group.id}-${entry.id}`}
              marker={<Icon className="size-3.5 stroke-[1.5]" />}
              label={entry.title}
              isActive={isActive && entry.isRunning}
              connectTop={hasReasoning || index > 0}
              labelClassName={cn({ 'text-critical': entry.failed })}
            >
              {entry.members && entry.members.length > 1 ? (
                <div className="flex flex-col gap-1 text-body-sm text-tertiary">
                  {entry.members.map((member) => (
                    <p
                      key={member.id}
                      className={cn('wrap-break-word', { 'text-critical': member.failed })}
                    >
                      {member.title}
                    </p>
                  ))}
                </div>
              ) : undefined}
            </ThinkingTrailItem>
          )
        })}

        {!isActive && (
          <ThinkingStatusRow
            status={anyFailed ? 'failed' : 'done'}
            label={anyFailed ? 'Job failed' : 'Done'}
            connectTop
          />
        )}
      </ThinkingDisclosure>
    </div>
  )
}
