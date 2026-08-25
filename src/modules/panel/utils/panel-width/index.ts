import {
  PANEL_WIDTH_MAX,
  PANEL_WIDTH_MIN,
  PANEL_WIDTH_STORAGE_KEY,
} from '../../constants'

/** Keeps a dragged or arrowed width inside the range the drawer supports. */
export function clampPanelWidth(width: number): number {
  if (!Number.isFinite(width)) return PANEL_WIDTH_MIN
  return Math.round(Math.min(PANEL_WIDTH_MAX, Math.max(PANEL_WIDTH_MIN, width)))
}

/**
 * `null` means "never resized" — the drawer then renders `var(--spacing-panel)`
 * rather than a hardcoded pixel value, so the token stays the source of truth.
 */
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
