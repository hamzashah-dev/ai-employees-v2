import {
  HANDLE_WIDTH,
  PANEL_WIDTH_MAX,
  PANEL_WIDTH_MIN,
  PANEL_WIDTH_STORAGE_KEY,
  THREAD_MIN_WIDTH,
} from '../../constants'

/**
 * Keeps a dragged, arrowed or stored width inside the range the drawer supports.
 *
 * `containerWidth` is the flex row holding the thread and the drawer: given it,
 * the ceiling becomes whatever leaves the conversation its floor, which is how
 * the shipped `useResizableDrawer` clamps. Without it (a stored value read
 * before the row has been measured) only the fixed range applies.
 */
export function clampPanelWidth(width: number, containerWidth?: number | null): number {
  if (!Number.isFinite(width)) return PANEL_WIDTH_MIN
  const ceiling =
    containerWidth == null || !Number.isFinite(containerWidth)
      ? PANEL_WIDTH_MAX
      : Math.min(PANEL_WIDTH_MAX, containerWidth - THREAD_MIN_WIDTH - HANDLE_WIDTH)
  // A window too narrow for both still has to render the drawer, so the floor wins.
  const max = Math.max(PANEL_WIDTH_MIN, ceiling)
  return Math.round(Math.min(max, Math.max(PANEL_WIDTH_MIN, width)))
}

/** `null` means "never resized", which the panel reads as the canvas default. */
export function readStoredPanelWidth(): number | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY)
    if (raw == null) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? clampPanelWidth(parsed) : null
  } catch {
    return null
  }
}

export function writeStoredPanelWidth(width: number): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(clampPanelWidth(width)))
  } catch {
    // A full or disabled localStorage must not break dragging.
  }
}
