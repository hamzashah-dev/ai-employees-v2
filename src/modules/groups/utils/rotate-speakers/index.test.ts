import { describe, expect, it } from 'vitest'
import { rotateGroupSpeakers } from './index'

const MEMBERS = ['alice', 'bob', 'carol']

describe('rotateGroupSpeakers', () => {
  it('leaves round 0 in seating order', () => {
    expect(rotateGroupSpeakers(MEMBERS, 0)).toEqual(['alice', 'bob', 'carol'])
  })

  it('advances the lead by one seat per round', () => {
    expect(rotateGroupSpeakers(MEMBERS, 1)).toEqual(['bob', 'carol', 'alice'])
    expect(rotateGroupSpeakers(MEMBERS, 2)).toEqual(['carol', 'alice', 'bob'])
  })

  it('wraps back to the first seat', () => {
    expect(rotateGroupSpeakers(MEMBERS, 3)).toEqual(['alice', 'bob', 'carol'])
    expect(rotateGroupSpeakers(MEMBERS, 7)).toEqual(['bob', 'carol', 'alice'])
  })

  it('keeps every member exactly once at every round', () => {
    for (let round = 0; round < 10; round += 1) {
      expect([...rotateGroupSpeakers(MEMBERS, round)].sort()).toEqual([
        'alice',
        'bob',
        'carol',
      ])
    }
  })

  it('returns a roster of fewer than two members unchanged', () => {
    expect(rotateGroupSpeakers([], 3)).toEqual([])
    expect(rotateGroupSpeakers(['alice'], 3)).toEqual(['alice'])
  })

  it('normalises a negative round instead of slicing from the wrong end', () => {
    expect(rotateGroupSpeakers(MEMBERS, -1)).toEqual(['carol', 'alice', 'bob'])
    expect(rotateGroupSpeakers(MEMBERS, -3)).toEqual(['alice', 'bob', 'carol'])
  })

  it('does not mutate the roster it was given', () => {
    const members = [...MEMBERS]
    rotateGroupSpeakers(members, 2)
    expect(members).toEqual(MEMBERS)
  })
})
