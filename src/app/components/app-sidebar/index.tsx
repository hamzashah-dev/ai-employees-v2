import { useEffect, type FC } from 'react'
import { useLocation } from 'react-router-dom'
import { Sheet, SheetContent, SheetTitle } from '@repo/ui/sheet'
import { VisuallyHidden } from '@repo/ui/visually-hidden'
import { useIsDesktopSmall } from '@/modules/core/hooks/media-query'
import { RosterSidebar } from '@/modules/roster'

/**
 * The sidebar's two presentations.
 *
 * The canvas is a single 1600px artboard, so it depicts no breakpoint at all; this follows
 * imagine-computer-web instead, where the fixed panel appears only from `desktop-sm`
 * (**1280px**, not 1024) and everything below gets a drawer over the content. Same 256px
 * either way — only the containment changes.
 */
interface AppSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AppSidebar: FC<AppSidebarProps> = ({ open, onOpenChange }) => {
  const isDesktopSmall = useIsDesktopSmall()
  const { pathname } = useLocation()

  // A drawer that survives navigation would cover the page it just opened.
  useEffect(() => {
    if (open) onOpenChange(false)
    // Only the route matters here; reacting to `open` would close it as it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (isDesktopSmall) return <RosterSidebar />

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/*
        `[&>button]:hidden` drops the Sheet's own close affordance — the sidebar is dismissed
        by picking a destination or tapping the overlay, and the canvas draws no close button.
        Focus is left where it was so opening the drawer does not steal it from the composer.
      */}
      <SheetContent
        side="left"
        onOpenAutoFocus={(event) => event.preventDefault()}
        // Radix warns unless a dialog either has a description or says it has none.
        aria-describedby={undefined}
        // The effect above covers a real navigation. Picking the row for the route you
        // are already on changes no pathname, so the drawer would sit there covering
        // the page it was just asked to show — and every row is a link, so one handler
        // here beats threading a callback down through the roster.
        onClick={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest('a')) {
            onOpenChange(false)
          }
        }}
        className="w-64 border-r-primary bg-primary p-0 desktop-sm:hidden [&>button]:hidden"
      >
        <VisuallyHidden>
          <SheetTitle>Sidebar</SheetTitle>
        </VisuallyHidden>
        {/* No collapsing inside an overlay — the same control dismisses it instead. */}
        <RosterSidebar collapsible={false} onDismiss={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
