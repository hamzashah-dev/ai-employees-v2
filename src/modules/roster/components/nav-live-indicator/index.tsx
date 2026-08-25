import { useMemo, type FC, type ReactNode } from 'react'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useSidebarCollapsed } from '../../contexts/sidebar-collapsed'
import { liveNavSignal } from '../../utils/live-nav-signal'

interface NavLiveIndicatorProps {
  /** What the row shows when nothing is live — its `Beta` badge, or nothing. */
  children?: ReactNode
}

/**
 * The `Employees` row's live chip (§4.1), and the 6px dot it becomes on the rail.
 *
 * Its own component so only the rows that opt in (`live` on the nav item) ever
 * subscribe to the chat store. Folding this into `NavRow` would re-render all
 * ten default-mode rows on every socket event to move one numeral.
 *
 * `state.threads` is selected whole rather than mapped in the selector: zustand
 * v5 compares the selector's result by identity, so returning a fresh object
 * from it re-renders forever. The derivation is a `useMemo` off the stable
 * reference instead.
 *
 * The dot takes the chip's *content* colour, not its fill. §4.1 says "same two
 * colours", but `bg-fill-secondary` is `#212121` against a `#0F0F0F` rail — a
 * 6px mark in it is invisible, which is not a state. `bg-fill-inverse` and
 * `bg-fill-warning` are exactly `content-primary` and `content-warning` in both
 * themes, so the dot is the chip's numeral colour. This follows the roster row,
 * whose unread dot is `content-brand` for the same reason.
 */
export const NavLiveIndicator: FC<NavLiveIndicatorProps> = ({ children }) => {
  const isCollapsed = useSidebarCollapsed()
  const threads = useChatStore((state) => state.threads)
  const signal = useMemo(() => liveNavSignal(threads), [threads])

  if (!signal) return <>{children}</>

  const needsYou = signal.tone === 'needs-you'

  if (isCollapsed) {
    return (
      <span
        role="img"
        aria-label={signal.label}
        // Positioned against the row, which is `relative` when collapsed: the
        // 16px glyph is centred in a 32px box, so its top-right corner is 6px
        // in from each edge of the row.
        className={cn('absolute top-1.5 right-1.5 size-1.5 rounded-full', {
          'bg-fill-warning': needsYou,
          'bg-fill-inverse': !needsYou,
        })}
      />
    )
  }

  return (
    <Badge
      size="md"
      variant={needsYou ? 'warning' : 'neutral-subtle'}
      aria-label={signal.label}
      className={cn('shrink-0 rounded-full px-2 tabular-nums', {
        // §4.1 puts the neutral chip's numeral at `content-primary`, one step up
        // from the `content-secondary` a `neutral-subtle` Badge ships with.
        'text-primary': !needsYou,
      })}
    >
      {signal.count}
    </Badge>
  )
}
