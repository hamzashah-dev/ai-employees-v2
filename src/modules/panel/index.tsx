import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { Sheet, SheetContent, SheetTitle } from '@repo/ui/sheet'
import { VisuallyHidden } from '@repo/ui/visually-hidden'
import { useIsLaptop } from '@/modules/core/hooks/media-query'
import { toDisplayName } from '@/modules/core/utils/identity'
import { EmployeeSummary } from './components/employee-summary'
import { PanelHeader } from './components/panel-header'
import { ResizeHandle } from './components/resize-handle'
import { RoutinesSection } from './components/routines-section'
import { ScreenPreview } from './components/screen-preview'
import { usePanelResize } from './hooks/use-panel-resize'

export interface EmployeePanelProps {
  profile: string
  onClose: () => void
}

/**
 * The employee drawer.
 *
 * From `laptop` up it is a sibling of the thread rather than an overlay: it takes its
 * width out of the layout, so the conversation reflows beside it and nothing is ever
 * covered. The width lives here — the shell does not need to know it.
 *
 * Below `laptop` it becomes a sheet, which is the shipped artifact drawer's own
 * `shouldShowSheet: !isLaptop` rule. Side by side there is not a real option down
 * there: the drawer's 360px floor plus the conversation's 500px leaves the thread a
 * sliver on a phone, and a 30px-wide transcript with the sidebar's own hamburger
 * inside it is worse than a full-screen takeover you can close.
 */
export const EmployeePanel: FC<EmployeePanelProps> = ({ profile, onClose }) => {
  const { panelRef, width, isDragging, onPointerDown, onKeyDown } = usePanelResize()
  const isLaptop = useIsLaptop()

  const body = (
    <>
      <PanelHeader onClose={onClose} />

      <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        <ScreenPreview />
        <p className="text-center text-label-sm text-tertiary">
          {toDisplayName(profile)}’s screen
        </p>
        {/* The canvas's own 12px breath between the screen and the routines. */}
        <div aria-hidden className="h-3 shrink-0" />
        <RoutinesSection profile={profile} />
        <EmployeeSummary profile={profile} />
      </div>
    </>
  )

  if (!isLaptop) {
    return (
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        {/* `aria-describedby={undefined}` is Radix's way of saying "there is no
            description", rather than leaving it to warn about the missing one. */}
        <SheetContent
          side="bottom"
          aria-describedby={undefined}
          className="flex h-dvh flex-col gap-0 rounded-none border-none bg-primary p-0"
        >
          <VisuallyHidden>
            <SheetTitle>{toDisplayName(profile)} details</SheetTitle>
          </VisuallyHidden>
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      ref={panelRef}
      aria-label={`${toDisplayName(profile)} details`}
      // The transition is dropped for the duration of a drag so the handle
      // tracks the pointer 1:1 instead of easing behind it.
      className={cn(
        'relative flex h-full min-h-0 shrink-0 flex-col border-l border-primary bg-primary',
        { 'transition-[width] duration-200 ease-linear': !isDragging },
      )}
      style={{ width }}
    >
      <ResizeHandle
        width={width}
        isDragging={isDragging}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      />
      {body}
    </aside>
  )
}
