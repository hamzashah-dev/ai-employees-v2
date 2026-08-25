import type { EmployeeStatus } from '@/modules/core/types/chat'

/**
 * §4.1's live signal on the `Employees` nav row, derived from the one source
 * that has it: the socket state the chat store already holds.
 *
 * Deliberately *not* built on the dashboard's `deriveSections`. That function
 * needs the roster, the per-profile descriptions and today's date, because it
 * produces the cards; this needs one numeral and one colour, and the row it
 * paints is drawn on the chat home (D2) where the sidebar has no reason to
 * fetch a roster at all. Two Hermes calls to draw a chip would be a real cost.
 *
 * The two derivations still have to agree about what a status *means*, and they
 * do: `error` sits with `needs-you` here exactly as it does in the roster row's
 * warn glyph and the team grid's pill — a turn that stopped short of an answer
 * wants the reader either way. `deriveSections.needsYes` is narrower only
 * because a card cannot render without an `approval` payload to put in it, so
 * the chip can legitimately count a blocked employee the dashboard has no card
 * for. That is a difference in what can be *shown*, not in what is true.
 */

/** Threads as the chat store keys them; narrowed to the field this reads. */
export type LiveThreads = Record<string, { status: EmployeeStatus } | undefined>

export interface LiveNavSignal {
  /** Employees that are live right now — working, plus waiting on a decision. */
  count: number
  /** Which of the two chips §4.1 draws. */
  tone: 'working' | 'needs-you'
  /** The chip renders a bare numeral; this is what a screen reader gets. */
  label: string
}

/** `null` when nothing is live — the row falls back to its `Beta` badge. */
export function liveNavSignal(threads: LiveThreads): LiveNavSignal | null {
  let working = 0
  let needsYou = 0

  for (const thread of Object.values(threads)) {
    if (thread?.status === 'working') working += 1
    if (thread?.status === 'needs-you' || thread?.status === 'error') needsYou += 1
  }

  const count = working + needsYou
  if (count === 0) return null

  /*
   * Warning outranks working. When both are true the chip goes warning: a
   * running employee needs nothing from the reader and a blocked one does, so
   * the colour belongs to the fact that can be acted on. The number stays the
   * whole live count either way — it is the same chip changing colour, not a
   * second chip, and a count that shrank when an employee got stuck would read
   * as one having finished.
   */
  if (needsYou === 0) {
    return {
      count,
      tone: 'working',
      label: `${count} ${count === 1 ? 'employee' : 'employees'} working`,
    }
  }

  const stuck = `${needsYou} ${needsYou === 1 ? 'needs' : 'need'} a yes`

  return {
    count,
    tone: 'needs-you',
    label:
      working === 0
        ? `${needsYou} ${needsYou === 1 ? 'employee needs' : 'employees need'} a yes`
        : `${count} employees active, ${stuck}`,
  }
}
