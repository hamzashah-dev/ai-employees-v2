/** Gap between consecutive messages that earns a time separator. */
export const TIME_SEPARATOR_MS = 15 * 60 * 1000

/**
 * How close to the bottom counts as "following along". Roughly one line of
 * body text plus the column's bottom padding, so a stray trackpad nudge does
 * not detach the view from a streaming reply.
 */
export const NEAR_BOTTOM_PX = 80
