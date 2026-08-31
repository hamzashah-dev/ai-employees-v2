import type { GroupHold, GroupMentionParse } from '@/modules/core/types/groups'

/**
 * The two vocabularies, matched on word boundaries so `stopwatch` is not a stop
 * and `Congo` is not a release.
 *
 * `go` earns its place in the release set because it is what people actually
 * type to unblock somebody ("@ada go"), and there is no stop word it can be
 * confused with.
 */
const STOP_WORD = /\b(stop|halt|pause)\b/i
const RESUME_WORD = /\b(resume|continue|go|proceed)\b/i

interface HoldAction {
  hold: string[]
  holdAll: boolean
  release: string[]
  releaseAll: boolean
}

/**
 * What one message does to the room's holds.
 *
 * Only USER text ever reaches here — member replies are appended by the round
 * loop rather than routed through the composer — so a member writing "stopped
 * work on that" can never hold anybody.
 *
 * Conservative by design: a stop word anywhere in a message that mentions
 * someone holds them, which means "don't stop @ada" holds @ada too. The
 * asymmetry is the point. A wrongly-held member is one mention away from
 * release; a wrongly-running one keeps doing the work it was told to stop.
 */
function classify(text: string, parsed: GroupMentionParse): HoldAction {
  const mentioned = [...parsed.mentioned]

  if (STOP_WORD.test(text)) {
    // A stop word wins over a resume word in the same breath ("stop, we will
    // continue later") — see the asymmetry above.
    return { hold: mentioned, holdAll: parsed.everyone, release: [], releaseAll: false }
  }

  if (RESUME_WORD.test(text)) {
    // '@all resume' clears the room, symmetric with '@all stop' holding it.
    return { hold: [], holdAll: false, release: mentioned, releaseAll: parsed.everyone }
  }

  // A plain direct mention releases: addressing a member overrides its hold,
  // because a held member that stays silent when asked a question reads as a
  // broken room rather than an obedient one.
  return { hold: [], holdAll: false, release: mentioned, releaseAll: false }
}

/**
 * The holds map after one user message.
 *
 * Holds are keyed by member at ROOM scope, never per thread: every composer
 * send mints a new thread, so a thread-scoped hold would never block the next
 * send's turns and the stop would not stick.
 *
 * A stop word with no mention and no `@all` holds nobody — a bare "stop" is the
 * stop *button's* job, and guessing at a target from an unaddressed sentence is
 * how a room silences the wrong member.
 */
export function applyGroupHoldDirective(
  holds: Record<string, GroupHold>,
  parsed: GroupMentionParse,
  text: string,
  at: number,
  allMembers: string[],
): Record<string, GroupHold> {
  const action = classify(text, parsed)

  if (action.releaseAll) return {}

  const next: Record<string, GroupHold> = { ...holds }

  for (const member of action.holdAll ? allMembers : action.hold) {
    // Overwriting rather than merging re-arms `noted`: a second explicit stop
    // deserves the room saying once more why that member is silent.
    next[member] = { at, noted: false }
  }

  for (const member of action.release) {
    delete next[member]
  }

  return next
}
