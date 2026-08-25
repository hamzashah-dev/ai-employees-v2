import type { PropsWithClassName } from '@repo/types/common'
import type { FC } from 'react'
import { cn } from '@repo/ui/cn'

/**
 * The small "live" dot: a brand gradient whose bright band sweeps as the inner disc
 * slowly rotates while the model works. Rotating rather than panning keeps the loop
 * seamless and preserves the gradient exactly.
 *
 * `motion-safe:` rather than a bare `animate-*` — `globals.css` already collapses every
 * animation to 0.01ms under reduced motion, which would freeze this on its *final*
 * frame; gating the class means it never starts and holds its initial one instead.
 */
export const ThinkingDot: FC<PropsWithClassName> = ({ className }) => (
  <span
    aria-hidden
    className={cn(
      'relative block size-3.5 shrink-0 overflow-hidden rounded-full',
      className,
    )}
  >
    <span
      aria-hidden
      className={cn(
        'absolute block size-[120%] shrink-0 rotate-310 rounded-full blur-[1px]',
        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'bg-[linear-gradient(90deg,#8B72F7_0%,#FF8789_33%,#FFB42B_66%,#8B72F7_100%)] bg-size-[200%_100%]',
        'motion-safe:animate-[shimmer_2.5s_linear_infinite]',
      )}
    />
  </span>
)
