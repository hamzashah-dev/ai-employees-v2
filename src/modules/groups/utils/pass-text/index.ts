/**
 * Silence, as a member spells it.
 *
 * Members are told to answer `(pass)` when they have nothing to add, but they
 * are language models being asked to emit an exact string, so they will send
 * `pass`, `Pass.`, `(PASS)` and every combination of those. Accepting only the
 * canonical form would turn a member's silence into a real message and keep a
 * settled round alive, so the matcher is deliberately generous — including
 * about the unbalanced `pass)` and `(pass` a truncated reply leaves behind.
 */
const PASS_RE = /^\(?\s*pass\s*\)?\.?$/i

/**
 * `unknown` rather than `string` because this reads a model reply that may be
 * absent: a turn that timed out or failed yields nothing, and nothing is
 * silence too.
 */
export function isGroupPassText(text: unknown): boolean {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return true

  return PASS_RE.test(trimmed)
}
