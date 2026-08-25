import type { PropsWithClassName } from '@repo/types/common'
import type { FC, ReactNode } from 'react'
import { CheckCircleIcon } from '@repo/icons/check-circle-icon'
import { CrossCircleIcon } from '@repo/icons/cross-circle'
import { cn } from '@repo/ui/cn'
import { ThinkingDot } from '../thinking-dot'

export type ThinkingStatus = 'active' | 'done' | 'failed'

export interface ThinkingStatusRowProps extends PropsWithClassName {
  status: ThinkingStatus
  label: ReactNode
  /** Draws a connector up to the previous row so the rail stays continuous. */
  connectTop?: boolean
}

/**
 * The trailing node of the thinking timeline: gradient dot + shimmering label while
 * active, a check when done, a cross when failed. `ThinkingDisclosure` renders this
 * outside the collapsible body, so it — plus the shimmering header — is the whole live
 * signal while the disclosure is folded.
 */
export const ThinkingStatusRow: FC<ThinkingStatusRowProps> = ({
  status,
  label,
  connectTop = false,
  className,
}) => (
  <div className={cn('flex w-fit items-center gap-3 py-0.5 pl-1.5', className)}>
    <span className="relative flex size-4 shrink-0 items-center justify-center">
      {connectTop && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-[calc(100%+4px)] mx-auto h-2 w-px bg-fill-tertiary"
        />
      )}
      {status === 'active' && <ThinkingDot className="size-3.5" />}
      {status === 'done' && (
        <CheckCircleIcon className="size-3.5 stroke-[1.5] text-secondary" />
      )}
      {status === 'failed' && (
        <CrossCircleIcon className="size-3.5 text-critical" />
      )}
    </span>

    <span
      className={cn('text-body-sm', {
        'animate-shimmer bg-clip-text text-transparent': status === 'active',
        'text-secondary': status === 'done',
        'text-critical': status === 'failed',
      })}
    >
      {label}
    </span>
  </div>
)
