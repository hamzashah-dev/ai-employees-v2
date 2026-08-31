import type { GroupMentionParse } from '@/modules/core/types/groups'

/**
 * Tokens that address the room rather than a member.
 *
 * `@user` is how the viewer's own lines are labelled in the transcript each
 * member is fed, so a member quoting the room back at itself must not be read
 * as summoning anybody.
 */
const EVERYONE_TOKENS = new Set(['all', 'everyone'])
const VIEWER_TOKEN = 'user'

/**
 * One mention, quoted (`@"data analyst"`) or bare (`@alice`). The quoted branch
 * comes first so an opening quote is consumed as a quote instead of terminating
 * the bare token before it starts.
 *
 * The bare charset deliberately swallows a trailing `.`, which `collapse` then
 * discards — `@alice.` at the end of a sentence has to resolve, and excluding
 * `.` from the charset would break `@first.last` instead.
 */
const MENTION_RE = /@(?:"([^"]*)"|([a-z0-9][a-z0-9._-]*))/gi

/**
 * The comparison form of a name: lowercased with every separator removed.
 *
 * This is the whole reason one profile answers to `@data-analyst`,
 * `@data_analyst`, `@dataanalyst` and `@"Data Analyst"` alike — the room never
 * stores an alias table, it just compares both sides stripped.
 */
function collapse(value: string): string {
  return value.toLowerCase().replace(/[\s._-]+/g, '')
}

/**
 * Deterministic @mention parse — no model, no fuzzy matching, no scoring.
 *
 * Who speaks next in a room is decided by this function alone, which is why it
 * has to be boring: an LLM router would make the same send produce a different
 * round on a retry, and a round is not cheap enough to be non-reproducible.
 *
 * A member that is not mentioned is simply absent from `mentioned`; an
 * unresolvable `@handle` is dropped rather than guessed at. Names resolve to
 * PROFILE NAMES, so the result can be intersected with a roster directly.
 */
export function parseGroupMentions(text: string, members: string[]): GroupMentionParse {
  const mentioned = new Set<string>()
  let everyone = false

  /**
   * Comparison form → profile name, rebuilt per call. A room's roster changes
   * between sends and a cached map would keep answering for a removed member.
   */
  const byForm = new Map<string, string>()

  for (const member of members) {
    const name = member.trim()
    if (!name) continue

    for (const form of [name.toLowerCase(), collapse(name)]) {
      // First writer wins, so where two members collapse to the same form the
      // earlier one keeps it rather than being silently shadowed. Their exact
      // forms still differ, and an exact hit is tried before a collapsed one.
      if (form && !byForm.has(form)) byForm.set(form, member)
    }
  }

  for (const match of text.matchAll(MENTION_RE)) {
    const token = (match[1] ?? match[2] ?? '').trim().toLowerCase()
    if (!token) continue

    const collapsed = collapse(token)

    if (EVERYONE_TOKENS.has(collapsed)) {
      everyone = true
      continue
    }

    if (collapsed === VIEWER_TOKEN) continue

    const resolved = byForm.get(token) ?? byForm.get(collapsed)
    if (resolved) mentioned.add(resolved)
  }

  return { mentioned, everyone }
}
