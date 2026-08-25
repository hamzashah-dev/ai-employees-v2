/**
 * Deliberately the same `'cron'` root the panel's routine queries use.
 *
 * The two modules cannot share a constant — a feature module may import from
 * `modules/core` and `@repo/*` only — but they must agree on the string, because
 * the panel's editor invalidates the whole `['cron', …]` prefix so that a
 * routine renamed in a drawer is renamed in this table too. Change one and you
 * have to change the other.
 */
export const ROUTINES_QUERY_KEY = 'cron'

/** The listing is one call for every employee, so `'all'` is its whole scope. */
export const ALL_ROUTINES_QUERY_KEY = [ROUTINES_QUERY_KEY, 'all'] as const

export const SKELETON_ROW_COUNT = 5
