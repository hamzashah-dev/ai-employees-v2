import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clampPanelWidth,
  readStoredPanelWidth,
  writeStoredPanelWidth,
} from '../../utils/panel-width'

interface PanelWidth {
  /** `null` until the user resizes: the drawer renders `var(--spacing-panel)`. */
  width: number | null
  setWidth: (next: number) => void
}

/**
 * Owns the drawer width.
 *
 * It lives here rather than in the app shell because nothing outside the panel
 * needs it — the thread simply reflows around whatever width the drawer takes.
 */
export function usePanelWidth(): PanelWidth {
  const [width, setWidthState] = useState<number | null>(readStoredPanelWidth)
  const latest = useRef<number | null>(width)

  const setWidth = useCallback((next: number) => {
    setWidthState(clampPanelWidth(next))
  }, [])

  // A drag reports a new width every frame, so the value is allowed to settle
  // before it reaches storage.
  useEffect(() => {
    latest.current = width
    if (width == null) return
    const timer = window.setTimeout(() => writeStoredPanelWidth(width), 150)
    return () => window.clearTimeout(timer)
  }, [width])

  // Closing the panel within that settling window would otherwise drop the
  // width the user just chose.
  useEffect(
    () => () => {
      if (latest.current != null) writeStoredPanelWidth(latest.current)
    },
    [],
  )

  return { width, setWidth }
}
