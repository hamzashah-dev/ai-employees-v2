import type { HermesSearchHit } from '@/modules/core/services/hermes/types'
import { toDate } from '@/modules/core/utils/time'

/**
 * The `Messages` group of D10 — and the reason it is the awkward half.
 *
 * Sessions live in a per-profile `state.db`: `search_sessions` in
 * `computer_cli/web_server.py` opens exactly one via
 * `_open_session_db_for_profile(profile)`, and there is no cross-profile search
 * route anywhere in that file. Searching the team therefore means one HTTP call
 * **per employee**, which on a full roster is dozens.
 *
 * Three things keep that from being one request storm per keystroke:
 *
 * - the caller debounces, so a burst of typing costs one fan-out, not one per key;
 * - React Query caches on the trimmed query, so backspacing to a query already
 *   searched costs nothing at all;
 * - and this pool caps how many are in flight at once. `useQueries` was the other
 *   option and was rejected for exactly this: it has no concurrency control, so a
 *   40-employee roster opens 40 sockets simultaneously and the browser queues
 *   them anyway — with 40 separate loading states to reconcile instead of one.
 *
 * A profile that throws is skipped rather than failing the batch. The handler
 * raises a 500 on any read error (a missing or locked `state.db`, a corrupt FTS
 * index), and one employee's broken database must not blank the other thirty-nine.
 */

export interface MessageHit extends HermesSearchHit {
  /** Which employee's `state.db` this came from — the API response omits it. */
  profile: string
}

export type SearchFn = (
  query: string,
  profile: string,
  limit: number,
) => Promise<HermesSearchHit[]>

/** Enough to fill the group without paying for a deep scan of every employee. */
export const HITS_PER_PROFILE = 5

/** Chrome allows six per host; leaving headroom keeps the roster query responsive. */
export const SEARCH_CONCURRENCY = 4

export async function searchAcrossProfiles(
  profiles: string[],
  query: string,
  search: SearchFn,
  concurrency: number = SEARCH_CONCURRENCY,
): Promise<MessageHit[]> {
  if (!query.trim() || profiles.length === 0) return []

  const queue = [...profiles]
  const hits: MessageHit[] = []

  const worker = async (): Promise<void> => {
    for (let profile = queue.shift(); profile; profile = queue.shift()) {
      try {
        const found = await search(query, profile, HITS_PER_PROFILE)
        for (const hit of found) hits.push({ ...hit, profile })
      } catch {
        // See above: one unreadable state.db costs that employee's rows, not the search.
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, profiles.length) }, worker)
  await Promise.all(workers)

  return hits.sort((a, b) => startedMs(b) - startedMs(a))
}

/**
 * Newest conversation first. FTS5 hands back BM25 relevance order, which is a
 * good ranking *within* one employee and meaningless across several — the scores
 * come from four separate databases and are not comparable. Recency is the only
 * ordering that means the same thing on every row.
 */
function startedMs(hit: MessageHit): number {
  return toDate(hit.session_started)?.getTime() ?? 0
}
