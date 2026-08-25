import type { PropsWithClassName } from '@repo/types/common'
import type { FC, PropsWithChildren } from 'react'
import { cn } from '@repo/ui/cn'

/**
 * Indents nested thinking content behind a thin vertical guide line, aligned under the
 * row's leading marker. The `w-4` spacer has to match the marker slot in
 * `ThinkingTrailItem` / `ThinkingStatusRow` exactly, or the rail kinks where a row's
 * body opens.
 */
export const ThinkingGuide: FC<PropsWithChildren & PropsWithClassName> = ({
  children,
  className,
}) => (
  <div className={cn('flex gap-3 pl-1.5', className)}>
    <div className="flex w-4 shrink-0 justify-center">
      <div className="w-px self-stretch rounded-full bg-fill-tertiary" />
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
)
