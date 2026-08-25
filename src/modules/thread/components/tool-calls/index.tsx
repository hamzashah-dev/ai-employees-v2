import type { FC } from 'react'
import { Spinner } from '@/modules/core/components/status-pill'
import type { ToolCall } from '@/modules/core/types/chat'

interface ToolCallsProps {
  tools: ToolCall[]
}

/** "1.2s" while it still reads as a moment, "2m 04s" once it does not. */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}m ${String(rest).padStart(2, '0')}s`
}

/**
 * What the employee did to answer, under what it said. Deliberately quiet: the
 * reply is the message, this is the receipt.
 */
export const ToolCalls: FC<ToolCallsProps> = ({ tools }) => {
  if (tools.length === 0) return null

  return (
    <ul className="flex flex-col gap-1 text-[rgb(var(--color-ink-7)/0.5)]">
      {tools.map((tool) => (
        <li key={tool.id} className="flex items-center gap-2">
          {/* Fixed slot so names line up whether or not a spinner is showing. */}
          <span className="flex size-3 shrink-0 items-center justify-center">
            {tool.status === 'running' && <Spinner />}
          </span>
          <span className="font-mono text-label-sm">{tool.name}</span>
          {tool.status === 'done' && tool.durationSeconds !== undefined && (
            <span className="font-mono text-label-sm">
              {formatDuration(tool.durationSeconds)}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
