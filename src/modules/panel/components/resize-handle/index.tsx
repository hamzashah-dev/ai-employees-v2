import {
  useEffect,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { cn } from '@/modules/core/utils/cn'
import { PANEL_WIDTH_MAX, PANEL_WIDTH_MIN, PANEL_WIDTH_STEP } from '../../constants'
import { clampPanelWidth } from '../../utils/panel-width'

interface ResizeHandleProps {
  /** The drawer's current width, in px. */
  width: number
  onResize: (width: number) => void
}

/**
 * The shipped artifact drawer's handle: a 1px line with a 3px hit area.
 *
 * A `role="separator"` with a tabindex is the ARIA window-splitter pattern, so
 * arrow keys move it for anyone who cannot drag. Pointer capture means a fast
 * drag that leaves the 3px strip — or the window — still tracks and still ends.
 */
export const ResizeHandle: FC<ResizeHandleProps> = ({ width, onResize }) => {
  const [dragging, setDragging] = useState(false)
  const origin = useRef<{ x: number; width: number } | null>(null)

  // The pointer spends a drag over the thread, not the handle, so the cursor
  // and the selection lock have to be set on the document for the duration.
  useEffect(() => {
    if (!dragging) return
    const { style } = document.body
    const previousCursor = style.cursor
    const previousSelect = style.userSelect
    style.cursor = 'col-resize'
    style.userSelect = 'none'
    return () => {
      style.cursor = previousCursor
      style.userSelect = previousSelect
    }
  }, [dragging])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    origin.current = { x: event.clientX, width }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Capture is an optimisation; the drag still works without it.
    }
    setDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = origin.current
    if (!start) return
    // The drawer is anchored right, so pulling the handle left widens it.
    onResize(clampPanelWidth(start.width + (start.x - event.clientX)))
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!origin.current) return
    origin.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const delta = event.key === 'ArrowLeft' ? PANEL_WIDTH_STEP : -PANEL_WIDTH_STEP
    onResize(clampPanelWidth(width + delta))
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      aria-valuenow={width}
      aria-valuemin={PANEL_WIDTH_MIN}
      aria-valuemax={PANEL_WIDTH_MAX}
      tabIndex={0}
      className="group absolute inset-y-0 left-0 z-10 -ml-[1px] w-[3px] cursor-col-resize touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-[1px] w-px',
          'group-hover:bg-[rgb(var(--color-brand)/0.35)]',
          'group-focus-visible:bg-[rgb(var(--color-brand)/0.35)]',
          dragging && 'bg-[rgb(var(--color-brand)/0.35)]',
        )}
      />
    </div>
  )
}
