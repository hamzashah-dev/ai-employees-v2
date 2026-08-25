import type { FC, KeyboardEvent, PointerEvent } from 'react'
import { cn } from '@repo/ui/cn'
import { PANEL_WIDTH_MAX, PANEL_WIDTH_MIN } from '../../constants'

interface ResizeHandleProps {
  /** The drawer's current width, in px — the slider's value. */
  width: number
  isDragging: boolean
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

/**
 * A 3px hit strip carrying a 1px line, straddling the drawer's own border.
 *
 * At rest the line is invisible: it sits exactly over `border-l border-primary`,
 * so the seam you see is the border, and the strip is only a target. Hover,
 * focus and drag turn it accent — the make code-pane splitter's treatment,
 * which is what the canvas draws.
 *
 * `role="slider"` rather than `separator`: the strip has a value, a range and
 * arrow keys, and a resize control with no keyboard path is not usable.
 */
export const ResizeHandle: FC<ResizeHandleProps> = ({
  width,
  isDragging,
  onPointerDown,
  onKeyDown,
}) => (
  <div
    role="slider"
    aria-orientation="vertical"
    aria-label="Resize panel"
    aria-valuenow={width}
    aria-valuemin={PANEL_WIDTH_MIN}
    aria-valuemax={PANEL_WIDTH_MAX}
    tabIndex={0}
    className="group absolute inset-y-0 -left-0.5 z-[2] w-[3px] cursor-col-resize touch-none select-none"
    onPointerDown={onPointerDown}
    onKeyDown={onKeyDown}
  >
    <div
      aria-hidden
      className={cn(
        'absolute inset-y-0 left-0.5 w-px transition-colors group-hover:bg-fill-brand group-focus-visible:bg-fill-brand',
        { 'bg-fill-brand': isDragging },
      )}
    />
  </div>
)
