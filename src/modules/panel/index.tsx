import { useCallback, useState, type FC } from 'react'
import { cn } from '@repo/ui/cn'
import { Sheet, SheetContent, SheetTitle } from '@repo/ui/sheet'
import { VisuallyHidden } from '@repo/ui/visually-hidden'
import { useIsLaptop } from '@/modules/core/hooks/media-query'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { BrowserDock } from './components/browser-dock'
import { IdentityBlock } from './components/identity-block'
import { LoginRequest } from './components/login-request'
import { PanelHeader } from './components/panel-header'
import { ResizeHandle } from './components/resize-handle'
import { RoutinesPreview } from './components/routines-preview'
import { WorkspaceSection } from './components/workspace-section'
import { useBrowserView } from './hooks/use-browser-view'
import { usePanelResize } from './hooks/use-panel-resize'

export interface EmployeePanelProps {
  profile: string
  onClose: () => void
}

/**
 * The employee panel.
 *
 * Everything about one employee, in one place: who they are, what they have written, what
 * they run on a schedule, and — only while it is happening — what their browser is doing.
 * It replaces two surfaces that used to disagree with each other. The info modal opened over
 * the conversation and held the same identity, the same workspace and the same connectors;
 * this drawer held a permanent drawing of a browser that was, in its own words, "not a
 * picture of anything". The modal is gone and the drawing with it.
 *
 * **Read-only, except the model.** Editing an employee's colour, shape or display name is a
 * per-device preference that changes nothing on disk, so it lives behind a deliberate open
 * (`AppearanceDialog`); routines open in their own dialog. The model picker is the exception
 * and stays inline, because it is the one control here that changes what the next turn does.
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

  const displayName = useDisplayName(profile)
  const isWorking = useChatStore((state) => state.threads[profile]?.status === 'working')
  const { liveUrl, agentBrowsing, steps, clarify, answer } = useBrowserView(profile)

  /*
   * The dock is drawn while there is a session to report, and not otherwise.
   *
   * Three signals, and each is here for a reason the other two do not cover:
   *
   * - `agentBrowsing` is a call *in flight*. On its own it flickers: it drops to false in
   *   the gap between every `tool.complete` and the next `tool.start`, which on a long
   *   browsing turn is several times a minute.
   * - So the turn holds it open — `isWorking` with steps already on the board means the
   *   employee is between browser calls, not finished with them. When the turn ends, so
   *   does the card, which is the canvas's idle state: no session, nothing drawn.
   * - `liveUrl` outlives both. An address is a browser that is still open and still
   *   signable-into, whether or not anything is driving it this second.
   */
  const hasBrowserSession =
    liveUrl !== null || agentBrowsing || (isWorking && steps.length > 0)

  const body = (
    <>
      <PanelHeader
        label={isWorking ? `${displayName} is working` : 'Employee'}
        onClose={onClose}
        // Below `laptop` the panel is already a full-height sheet, so there is
        // nothing to maximize into.
        onToggleMaximize={isLaptop ? toggleMaximize : undefined}
        isMaximized={isMaximized}
      />

      <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pt-1 pb-4">
        <IdentityBlock profile={profile} />

        {/* The request goes above everything it is about: it is the thing that has stopped,
            and until it is answered nothing else in here will change. */}
        {clarify && <LoginRequest request={clarify} onAnswer={answer} />}

        <WorkspaceSection profile={profile} displayName={displayName} />
        <RoutinesPreview profile={profile} displayName={displayName} />

        {/*
          The slug, said out loud, last.
          A display name is a label this device puts over the profile directory — Hermes has
          no rename and no name field — so the panel names the real thing rather than letting
          a local label quietly stand in for it everywhere.
        */}
        <p className="text-label-xs text-tertiary">
          Hermes’ own name for this employee is <code className="font-mono">{profile}</code>.
        </p>
      </div>

      {hasBrowserSession && (
        <BrowserDock
          liveUrl={liveUrl}
          agentBrowsing={agentBrowsing}
          steps={steps}
          isExpanded={isMaximized}
          onToggleExpand={isLaptop ? toggleMaximize : undefined}
        />
      )}
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
