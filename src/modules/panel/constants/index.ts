/** Panel-wide constants. */

/**
 * Mirrors `--spacing-panel` in globals.css. The drawer renders the token
 * itself until the user drags it, so this number is only needed for the drag
 * and keyboard arithmetic — keep the two in step if the token ever moves.
 */
export const PANEL_WIDTH_DEFAULT = 480

/** The drag range the canvas calls for: narrow enough to skim, wide enough to read. */
export const PANEL_WIDTH_MIN = 360
export const PANEL_WIDTH_MAX = 720

/** One ArrowLeft/ArrowRight press. */
export const PANEL_WIDTH_STEP = 16

/** Per-device preference, not synced state — the same reasoning as identity overrides. */
export const PANEL_WIDTH_STORAGE_KEY = 'employees:panel-width'

/** Query keys. `['cron', profile]` is invalidated by every routine mutation. */
export const ROUTINES_QUERY_KEY = 'cron'
export const PROFILES_QUERY_KEY = 'profiles'
