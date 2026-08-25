import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
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
 * A sibling of the thread rather than an overlay: it takes its width out of the
 * layout, so the conversation reflows beside it and nothing is ever covered.
 * The width lives here — the shell does not need to know it.
 */
export const EmployeePanel: FC<EmployeePanelProps> = ({ profile, onClose }) => {
  const { panelRef, width, isDragging, onPointerDown, onKeyDown } = usePanelResize()

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
    </aside>
  )
}
