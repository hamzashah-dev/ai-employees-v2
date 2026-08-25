/** Panel-wide constants. */

/** The drawer's width in the canvas, and what it opens at. */
export const PANEL_WIDTH_DEFAULT = 480

/** The drag range the canvas calls for: narrow enough to skim, wide enough to read. */
export const PANEL_WIDTH_MIN = 360
export const PANEL_WIDTH_MAX = 720

/**
 * What the conversation keeps for itself however far the handle is dragged.
 *
 * Mirrors `CHAT_MIN_WIDTH` in the shipped artifact drawer, where the maximum is
 * a function of the container rather than a constant — so a narrow window
 * shrinks the drawer instead of squeezing the thread to nothing.
 */
export const THREAD_MIN_WIDTH = 500

/** The handle's hit strip, per the canvas. The drag anchors on its centre. */
export const HANDLE_WIDTH = 3

/** One ArrowLeft/ArrowRight press — the shipped code-pane splitter's step. */
export const PANEL_WIDTH_STEP = 8

/** Per-device preference, not synced state — the same reasoning as identity overrides. */
export const PANEL_WIDTH_STORAGE_KEY = 'employees:panel-width'

/** Query keys. `['cron', profile]` is invalidated by every routine mutation. */
export const ROUTINES_QUERY_KEY = 'cron'
export const PROFILES_QUERY_KEY = 'profiles'
