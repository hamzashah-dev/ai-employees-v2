import { describe, expect, it } from 'vitest'
import { parseGroupMentions } from './index'

/**
 * Rooms are addressed by hand, so the cases that matter are the ones a person
 * actually types: the wrong separator, a trailing comma, a name with a space in
 * it, and `@everyone` when they cannot remember who is in the room.
 */

const MEMBERS = ['alice', 'data-analyst', 'Bob Ross']

function mentioned(text: string, members: string[] = MEMBERS): string[] {
  return [...parseGroupMentions(text, members).mentioned]
}

describe('parseGroupMentions', () => {
  it('resolves a bare profile name to the profile name', () => {
    expect(mentioned('@alice can you take this?')).toEqual(['alice'])
  })

  it('matches case-insensitively', () => {
    expect(mentioned('@ALICE @Data-Analyst')).toEqual(['alice', 'data-analyst'])
  })

  it('matches a name with the separators collapsed out', () => {
    expect(mentioned('@dataanalyst')).toEqual(['data-analyst'])
    expect(mentioned('@data_analyst')).toEqual(['data-analyst'])
    expect(mentioned('@data.analyst')).toEqual(['data-analyst'])
    expect(mentioned('@bobross')).toEqual(['Bob Ross'])
  })

  it('matches the quoted form for a name containing a space', () => {
    expect(mentioned('@"Bob Ross" what do you think?')).toEqual(['Bob Ross'])
    expect(mentioned('@"bob ross"')).toEqual(['Bob Ross'])
    expect(mentioned('@"data analyst"')).toEqual(['data-analyst'])
  })

  it('ignores an empty quoted mention', () => {
    expect(parseGroupMentions('@"" hello', MEMBERS)).toEqual({
      mentioned: new Set(),
      everyone: false,
    })
  })

  it('resolves a mention pressed against punctuation', () => {
    expect(mentioned('@alice, and @data-analyst.')).toEqual(['alice', 'data-analyst'])
    expect(mentioned('(@alice)')).toEqual(['alice'])
    expect(mentioned('@alice!')).toEqual(['alice'])
    expect(mentioned('ping @alice: go')).toEqual(['alice'])
  })

  it('sets everyone for @everyone and @all without naming anybody', () => {
    for (const text of ['@everyone', '@all', '@Everyone.', 'hey @ALL']) {
      const parse = parseGroupMentions(text, MEMBERS)
      expect(parse.everyone).toBe(true)
      expect([...parse.mentioned]).toEqual([])
    }
  })

  it('keeps everyone alongside a named member', () => {
    const parse = parseGroupMentions('@everyone but @alice leads', MEMBERS)
    expect(parse.everyone).toBe(true)
    expect([...parse.mentioned]).toEqual(['alice'])
  })

  it('never treats @user as a member', () => {
    expect(parseGroupMentions('@user asked for this', MEMBERS)).toEqual({
      mentioned: new Set(),
      everyone: false,
    })
  })

  it('drops a handle that matches no member', () => {
    expect(mentioned('@carol @nobody @example.com')).toEqual([])
  })

  it('resolves a member mentioning itself', () => {
    expect(mentioned('@alice here, taking it')).toEqual(['alice'])
  })

  it('deduplicates repeated mentions of the same member', () => {
    expect(mentioned('@alice @ALICE @"alice"')).toEqual(['alice'])
  })

  it('returns nothing for text with no mention at all', () => {
    expect(parseGroupMentions('email bob at bob@ or not', MEMBERS)).toEqual({
      mentioned: new Set(),
      everyone: false,
    })
  })

  it('returns nothing for an empty roster', () => {
    expect(parseGroupMentions('@alice @everybody', [])).toEqual({
      mentioned: new Set(),
      everyone: false,
    })
  })

  it('still reads @everyone with an empty roster', () => {
    expect(parseGroupMentions('@all', []).everyone).toBe(true)
  })

  it('skips a blank roster entry rather than matching a bare @', () => {
    expect(mentioned('@alice', ['', '   ', 'alice'])).toEqual(['alice'])
  })

  it('gives an ambiguous collapsed form to the earlier member', () => {
    expect(mentioned('@dataanalyst', ['dataanalyst', 'data-analyst'])).toEqual([
      'dataanalyst',
    ])
    expect(mentioned('@data-analyst', ['dataanalyst', 'data-analyst'])).toEqual([
      'data-analyst',
    ])
  })
})
