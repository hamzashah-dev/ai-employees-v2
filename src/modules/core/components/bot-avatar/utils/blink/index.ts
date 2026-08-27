/**
 * The blink: "optimized random animation (blinking) - not all the time".
 *
 * Split out from the scene because it is the one piece of the animation with a right and a
 * wrong answer, and it is testable without a GPU. Everything here is pure — the scene owns
 * the clock and hands it deltas.
 */

/** One close-and-open, in milliseconds. Short enough to read as a blink, not a wink. */
export const BLINK_DURATION_MS = 240

/**
 * How far the eyes close. Not to zero: a lid that hits exactly 0 scale makes the eye mesh
 * degenerate and flicker its normals on the frame it turns around.
 */
const BLINK_CLOSE = 0.94

/**
 * Eye height over the course of a blink, as a multiplier of the resting height.
 *
 * Linear down and linear back up, matching the prototype. A real eye closes faster than it
 * opens, but at 240ms nobody can see the asymmetry and the symmetric curve is what the look
 * was signed off against.
 */
export const blinkScale = (elapsedMs: number, duration = BLINK_DURATION_MS): number => {
  if (elapsedMs <= 0 || elapsedMs >= duration) return 1
  const progress = elapsedMs / duration
  return progress < 0.5
    ? 1 - (progress / 0.5) * BLINK_CLOSE
    : 1 - BLINK_CLOSE + ((progress - 0.5) / 0.5) * BLINK_CLOSE
}

const BLINK_MIN_MS = 2_200
const BLINK_SPREAD_MS = 2_800
/** How often the next blink is a quick follow-up rather than a fresh idle wait. */
const DOUBLE_BLINK_CHANCE = 0.2
const DOUBLE_BLINK_PULL_MS = 1_700
/**
 * Two blinks closer together than this stop reading as a double-take and start twitching.
 *
 * The constants above cannot currently reach it — the shortest possible wait is 500ms — so
 * this is a guard on future tuning rather than a live clamp. It is here because the failure
 * it prevents (a stuttering eyelid) is the kind nobody notices until a user reports that the
 * avatar "looks broken".
 */
const BLINK_FLOOR_MS = 420

/**
 * How long until the next blink.
 *
 * A fixed interval is the thing that makes an idle character look like a machine, so the
 * wait is 2.2–5s, and one in five is pulled 1.7s earlier to land as a double blink.
 *
 * `random` is injected so the schedule can be tested without owning `Math.random`.
 */
export const nextBlinkDelayMs = (random: () => number = Math.random): number => {
  const wait = BLINK_MIN_MS + random() * BLINK_SPREAD_MS
  const pulled = random() < DOUBLE_BLINK_CHANCE ? wait - DOUBLE_BLINK_PULL_MS : wait
  return Math.max(BLINK_FLOOR_MS, pulled)
}
