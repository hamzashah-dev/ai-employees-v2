/**
 * The caps that keep a room from spinning.
 *
 * These are the desktop plugin's values, kept identical on purpose: they are
 * the difference between a room that settles and one that talks to itself
 * until the budget runs out. Changing any of them changes the felt behaviour
 * of every room, so treat them as product decisions rather than tuning knobs.
 */

/** Serial round-robin passes over the roster per user send. */
export const GROUP_MAX_ROUNDS = 3

/** Replies actually posted per user send, across all rounds. */
export const GROUP_MAX_MESSAGES = 10

/**
 * Extra rounds granted when a round goes quiet but an `@mention` handoff is
 * still unanswered. Budgeted separately from `GROUP_MAX_MESSAGES` so a
 * pathological mention chain cannot eat the whole room allowance.
 */
export const GROUP_MAX_CONTINUATIONS = 2

/** Entries kept in a room log. Trimming drops from the front. */
export const GROUP_HISTORY_LIMIT = 24

export const GROUP_MIN_MEMBERS = 2
export const GROUP_MAX_MEMBERS = 6

/**
 * How long one member's turn may run before the round moves on. The turn is
 * not killed — it is marked stranded and its reply is harvested by a later
 * round, so slow work is late rather than lost.
 */
export const GROUP_TURN_TIMEOUT_MS = 180_000

/** How often a dispatched turn is polled for completion. */
export const GROUP_TURN_POLL_MS = 2_000

/**
 * Ceiling on harvesting a stranded turn. Past this the reply is abandoned —
 * the member is assumed dead rather than slow.
 */
export const GROUP_TURN_HARD_CAP_MS = 1_200_000

/** The exact text a member sends to stay silent. */
export const GROUP_PASS_TEXT = '(pass)'

/** Session title prefix. Titles are `Group: <roomId>`, never the display name. */
export const GROUP_SESSION_TITLE_PREFIX = 'Group: '

/** Marks entries written before threading existed. */
export const GROUP_LEGACY_THREAD = 'legacy'
