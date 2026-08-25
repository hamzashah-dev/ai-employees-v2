import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, RefObject } from 'react'
import { HANDLE_WIDTH, PANEL_WIDTH_DEFAULT, PANEL_WIDTH_STEP } from '../../constants'
import {
  clampPanelWidth,
  readStoredPanelWidth,
  writeStoredPanelWidth,
} from '../../utils/panel-width'

interface PanelResize {
  /** Goes on the drawer itself; its parent is the row the drag measures. */
  panelRef: RefObject<HTMLElement | null>
  width: number
  isDragging: boolean
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

/**
 * The drawer's width, and the two ways to change it.
 *
 * The mechanism is the shipped `useResizableDrawer`: the width is derived from
 * the container's right edge minus the pointer, clamped against the container's
 * own width, and a `ResizeObserver` re-clamps on every layout change so a
 * narrowing window shrinks the drawer rather than crushing the thread. Two
 * departures, both deliberate:
 *
 * - the container is read as the drawer's `parentElement` rather than passed in,
 *   so the shell does not have to know the drawer is resizable;
 * - the width is persisted (the shipped drawer re-derives it each mount), so
 *   reopening the panel gives you back the width you chose.
 *
 * Arrow-key support comes from the make code-pane splitter, the one accessible
 * handle in the shipped app.
 */
export const usePanelResize = (): PanelResize => {
  const panelRef = useRef<HTMLElement | null>(null)
  const [width, setWidth] = useState(
    () => readStoredPanelWidth() ?? PANEL_WIDTH_DEFAULT,
  )
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  // A pointerup handler needs the width the drag landed on, not the width at
  // the time it was bound.
  const widthRef = useRef(width)

  useEffect(() => {
    widthRef.current = width
  }, [width])

  const commit = useCallback((next: number) => {
    setWidth(next)
    writeStoredPanelWidth(next)
  }, [])

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    // The pointer spends the drag over the thread, not the 3px strip, so the
    // cursor and the selection lock have to be held on the document.
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      // The drawer is anchored right, so ArrowLeft widens it.
      const delta = event.key === 'ArrowLeft' ? PANEL_WIDTH_STEP : -PANEL_WIDTH_STEP
      commit(clampPanelWidth(widthRef.current + delta, containerWidth(panelRef)))
    },
    [commit],
  )

  // Seeds and re-clamps against the row that holds the thread and the drawer.
  useEffect(() => {
    const container = panelRef.current?.parentElement
    if (!container) return

    const observer = new ResizeObserver(() => {
      setWidth((previous) =>
        clampPanelWidth(previous, container.getBoundingClientRect().width),
      )
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Window-level, not on the strip: a fast drag leaves a 3px target long before
  // the pointer stops moving, and the pointer can be released anywhere.
  useEffect(() => {
    const release = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    const onPointerMove = (event: globalThis.PointerEvent) => {
      const container = panelRef.current?.parentElement
      if (!isDraggingRef.current || !container) return
      const rect = container.getBoundingClientRect()
      setWidth(
        clampPanelWidth(rect.right - event.clientX - HANDLE_WIDTH / 2, rect.width),
      )
    }

    const onPointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      release()
      // A drag reports a width every frame; only where it lands is worth storing.
      writeStoredPanelWidth(widthRef.current)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      release()
    }
  }, [])

  return { panelRef, width, isDragging, onPointerDown, onKeyDown }
}

function containerWidth(panelRef: RefObject<HTMLElement | null>): number | null {
  const container = panelRef.current?.parentElement
  return container ? container.getBoundingClientRect().width : null
}
