import { useCallback, useState, type FC } from 'react'
import { cn } from '@repo/ui/cn'
import { Sheet, SheetContent, SheetTitle } from '@repo/ui/sheet'
import { VisuallyHidden } from '@repo/ui/visually-hidden'
import { useIsLaptop } from '@/modules/core/hooks/media-query'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { EmployeeSummary } from './components/employee-summary'
import { PanelHeader } from './components/panel-header'
import { ResizeHandle } from './components/resize-handle'
import { RoutineEditor } from './components/routine-editor'
import { RoutinesSection } from './components/routines-section'
import { ScreenActions } from './components/screen-actions'
import { ScreenPreview } from './components/screen-preview'
import { usePanelResize } from './hooks/use-panel-resize'
import { usePanelView } from './hooks/use-panel-view'

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
 *
 * Maximize is the shipped drawer's own state, not a new mode. There,
 * `isMaximized` swaps the drawer's width for `100%` and stops rendering its
 * drag handle, and the chat column — `flex-1 min-w-0` — flexes to nothing
 * beside it. Same two changes here, which is why the thread needs no knowledge
 * of the state: it is squeezed out by ordinary flex, and the drawer is the
 * positioned, opaque sibling that paints over what is left.
 */
export const EmployeePanel: FC<EmployeePanelProps> = ({ profile, onClose }) => {
  const { panelRef, width, isDragging, onPointerDown, onKeyDown } = usePanelResize()
  const isLaptop = useIsLaptop()
  const [isMaximized, setIsMaximized] = useState(false)
  // One toggle, two controls: the header's button and the frame's own. Stable so
  // the frame's focus listener is not re-bound on every render.
  const toggleMaximize = useCallback(() => setIsMaximized((on) => !on), [])
  const { view, backLabel, back, openEditor } = usePanelView(onClose)
  const displayName = useDisplayName(profile)

  const body = (
    <>
      <PanelHeader
        onBack={back}
        backLabel={backLabel}
        onClose={onClose}
        // Below `laptop` the drawer is already a full-height sheet, so there is
        // nothing to maximize into.
        onToggleMaximize={isLaptop ? toggleMaximize : undefined}
        isMaximized={isMaximized}
      />

      <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {view.name === 'editor' ? (
          <RoutineEditor
            profile={profile}
            job={view.job}
            onDone={back}
            onCancel={back}
          />
        ) : (
          <>
            {/*
              At the default width the preview is already the canvas's 16:10
              (448 x 280 inside the 480px drawer). Maximized it cannot stay
              16:10 — 16:10 of a 1352px content width is 845px tall, which is
              the whole viewport, leaving no room for the action strip the
              design puts beneath it. A capped height is the honest resolution;
              the canvas is silent on the maximized aspect.
            */}
            <ScreenPreview
              profile={profile}
              /*
               * No height override any more, in either state: the frame sizes
               * itself 16:9 from its width, because that is the only ratio that
               * leaves no grey letterbox around the 1920x1080 remote screen
               * (see BOX in browser-frame). Forcing a height here would put the
               * bars straight back — which is what a `h-[52vh]` was doing.
               */
              className={cn({ 'max-w-none': isMaximized })}
              isExpanded={isMaximized}
              onToggleExpand={isLaptop ? toggleMaximize : undefined}
            />
            <p className="text-center text-label-sm text-tertiary">
              {displayName}’s screen
            </p>
            {isMaximized && (
              <div className="pt-3">
                <ScreenActions profile={profile} displayName={displayName} />
              </div>
            )}
            {/* The canvas's own 12px breath between the screen and the routines. */}
            <div aria-hidden className="h-3 shrink-0" />
            <RoutinesSection profile={profile} onEdit={openEditor} />
            <EmployeeSummary profile={profile} />
          </>
        )}
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
            <SheetTitle>{displayName} details</SheetTitle>
          </VisuallyHidden>
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      ref={panelRef}
      aria-label={`${displayName} details`}
      // The transition is dropped for the duration of a drag so the handle
      // tracks the pointer 1:1 instead of easing behind it.
      className={cn(
        'relative flex h-full min-h-0 shrink-0 flex-col bg-primary',
        { 'transition-[width] duration-200 ease-linear': !isDragging },
        // Maximized there is nothing to its left to be divided from.
        { 'border-l border-primary': !isMaximized },
      )}
      style={{ width: isMaximized ? '100%' : width }}
    >
      {!isMaximized && (
        <ResizeHandle
          width={width}
          isDragging={isDragging}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
        />
      )}
      {body}
    </aside>
  )
}
