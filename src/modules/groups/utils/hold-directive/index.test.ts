import { describe, expect, it } from 'vitest'
import type { GroupHold, GroupMentionParse } from '@/modules/core/types/groups'
import { applyGroupHoldDirective } from './index'

/**
 * The matrix that matters is (stop word | resume word | neither) × (one
 * mention | @all | no mention). Everything else in this file guards the two
 * properties the round loop leans on: the input map is never mutated, and a
 * held member is always exactly one message away from release.
 */

const MEMBERS = ['ada', 'grace', 'linus']

const AT = 1_700_000_000_000

function parse(mentioned: string[], everyone = false): GroupMentionParse {
  return { mentioned: new Set(mentioned), everyone }
}

function held(at = AT, noted = false): GroupHold {
  return { at, noted }
}

describe('applyGroupHoldDirective — stop words', () => {
  it('holds the mentioned member', () => {
    const next = applyGroupHoldDirective({}, parse(['ada']), 'stop @ada', AT, MEMBERS)

    expect(next).toEqual({ ada: { at: AT, noted: false } })
  })

  it('holds every mentioned member', () => {
    const next = applyGroupHoldDirective(
      {},
      parse(['ada', 'linus']),
      '@ada @linus pause for a moment',
      AT,
      MEMBERS,
    )

    expect(Object.keys(next).sort()).toEqual(['ada', 'linus'])
  })

  it.each(['stop @ada', 'halt @ada', 'please pause @ada', 'STOP @ada'])(
    'treats %j as a stop',
    (text) => {
      expect(applyGroupHoldDirective({}, parse(['ada']), text, AT, MEMBERS)).toHaveProperty('ada')
    },
  )

  it('holds a mentioned member even when the sentence says not to', () => {
    // Conservative on purpose: a wrongly-held member is one mention away from
    // release, a wrongly-running one keeps working.
    const next = applyGroupHoldDirective({}, parse(['ada']), "don't stop @ada", AT, MEMBERS)

    expect(next).toHaveProperty('ada')
  })

  it('holds when a stop word and a resume word share the message', () => {
    const next = applyGroupHoldDirective(
      {},
      parse(['ada']),
      '@ada stop for now, we continue tomorrow',
      AT,
      MEMBERS,
    )

    expect(next).toEqual({ ada: { at: AT, noted: false } })
  })

  it('holds nobody when a stop word arrives with no mention', () => {
    const next = applyGroupHoldDirective({}, parse([]), 'stop', AT, MEMBERS)

    expect(next).toEqual({})
  })

  it('ignores a stop word buried inside a longer word', () => {
    const next = applyGroupHoldDirective({}, parse(['ada']), '@ada check the stopwatch', AT, MEMBERS)

    expect(next).toEqual({})
  })

  it('holds every member on @all stop, mentioned or not', () => {
    const next = applyGroupHoldDirective({}, parse([], true), '@all stop', AT, MEMBERS)

    expect(Object.keys(next).sort()).toEqual([...MEMBERS].sort())
    expect(next['grace']).toEqual({ at: AT, noted: false })
  })

  it('holds nothing on @all stop when the roster is empty', () => {
    expect(applyGroupHoldDirective({}, parse([], true), '@everyone halt', AT, [])).toEqual({})
  })

  it('keeps unrelated holds while adding a new one', () => {
    const next = applyGroupHoldDirective(
      { grace: held(1, true) },
      parse(['ada']),
      'stop @ada',
      AT,
      MEMBERS,
    )

    expect(next).toEqual({ grace: { at: 1, noted: true }, ada: { at: AT, noted: false } })
  })

  it('re-arms noted when an already-noted member is stopped again', () => {
    const next = applyGroupHoldDirective(
      { ada: held(1, true) },
      parse(['ada']),
      'stop @ada',
      AT,
      MEMBERS,
    )

    expect(next['ada']).toEqual({ at: AT, noted: false })
  })
})

describe('applyGroupHoldDirective — resume words', () => {
  it.each(['@ada resume', '@ada continue', '@ada go', '@ada proceed'])(
    'releases on %j',
    (text) => {
      const next = applyGroupHoldDirective({ ada: held() }, parse(['ada']), text, AT, MEMBERS)

      expect(next).toEqual({})
    },
  )

  it('releases only the mentioned member', () => {
    const next = applyGroupHoldDirective(
      { ada: held(), grace: held(5, true) },
      parse(['ada']),
      '@ada resume',
      AT,
      MEMBERS,
    )

    expect(next).toEqual({ grace: { at: 5, noted: true } })
  })

  it('releases the whole room on @all resume', () => {
    const next = applyGroupHoldDirective(
      { ada: held(), grace: held(), offboarded: held() },
      parse([], true),
      '@all resume',
      AT,
      MEMBERS,
    )

    // Including a member no longer on the roster: release-all means release-all.
    expect(next).toEqual({})
  })

  it('releases nobody when a resume word arrives with no mention', () => {
    const holds = { ada: held() }
    const next = applyGroupHoldDirective(holds, parse([]), 'lets continue', AT, MEMBERS)

    expect(next).toEqual({ ada: { at: AT, noted: false } })
  })

  it('ignores a resume word buried inside a longer word', () => {
    const holds = { ada: held(1, true) }
    const next = applyGroupHoldDirective(holds, parse([]), 'the Congo report is in', AT, MEMBERS)

    expect(next).toEqual(holds)
  })

  it('is a no-op when the released member was never held', () => {
    const next = applyGroupHoldDirective({}, parse(['linus']), '@linus go ahead', AT, MEMBERS)

    expect(next).toEqual({})
  })
})

describe('applyGroupHoldDirective — plain mentions', () => {
  it('releases a held member that is addressed directly', () => {
    const next = applyGroupHoldDirective(
      { ada: held(1, true) },
      parse(['ada']),
      '@ada what did the audit say?',
      AT,
      MEMBERS,
    )

    expect(next).toEqual({})
  })

  it('leaves holds untouched when nobody is mentioned', () => {
    const holds = { ada: held(), grace: held(2, true) }
    const next = applyGroupHoldDirective(holds, parse([]), 'thanks all', AT, MEMBERS)

    expect(next).toEqual(holds)
  })

  it('does not release the room on a bare @all with no directive word', () => {
    // '@all' alone is an address, not a release: only a resume word clears the
    // whole room.
    const holds = { ada: held(), grace: held() }
    const next = applyGroupHoldDirective(holds, parse([], true), '@all standup in five', AT, MEMBERS)

    expect(next).toEqual(holds)
  })
})

describe('applyGroupHoldDirective — purity', () => {
  it('never mutates the holds it was given', () => {
    const holds: Record<string, GroupHold> = { ada: held(1, true), grace: held(2, false) }
    const snapshot = structuredClone(holds)

    applyGroupHoldDirective(holds, parse(['ada']), 'stop @ada', AT, MEMBERS)
    applyGroupHoldDirective(holds, parse(['grace']), '@grace resume', AT, MEMBERS)
    applyGroupHoldDirective(holds, parse([], true), '@all resume', AT, MEMBERS)

    expect(holds).toEqual(snapshot)
  })

  it('returns a fresh record even when nothing changed', () => {
    const holds = { ada: held() }

    expect(applyGroupHoldDirective(holds, parse([]), 'no directive here', AT, MEMBERS)).not.toBe(
      holds,
    )
  })

  it('round-trips: a held member is one mention away from running again', () => {
    const stopped = applyGroupHoldDirective({}, parse(['ada']), '@ada stop', AT, MEMBERS)
    const released = applyGroupHoldDirective(stopped, parse(['ada']), '@ada one more thing', AT, MEMBERS)

    expect(stopped).toHaveProperty('ada')
    expect(released).toEqual({})
  })
})
