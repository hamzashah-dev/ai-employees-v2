import { describe, expect, it } from 'vitest'
import { PHRASES, advanceBag, createBag, phraseAt } from '.'

/**
 * The rotation's whole point is the two properties below, and both hold for any random
 * seed — so these run against real `Math.random()` rather than a stub.
 */
describe('phrase bag', () => {
  const walk = (steps: number) => {
    let bag = createBag()
    const seen = [phraseAt(bag)]
    for (let i = 1; i < steps; i++) {
      bag = advanceBag(bag)
      seen.push(phraseAt(bag))
    }
    return seen
  }

  it('shows every phrase exactly once per bag', () => {
    const seen = walk(PHRASES.length)
    expect(new Set(seen).size).toBe(PHRASES.length)
    expect([...seen].sort()).toEqual([...PHRASES].sort())
  })

  it('never repeats a phrase back to back, including across the bag boundary', () => {
    // Four bags' worth: enough to cross the boundary repeatedly.
    const seen = walk(PHRASES.length * 4)
    const repeats = seen.filter((phrase, i) => i > 0 && phrase === seen[i - 1])
    expect(repeats).toEqual([])
  })

  it('reshuffles rather than replaying the same order', () => {
    let bag = createBag()
    const first = [...bag.order]
    for (let i = 0; i < PHRASES.length; i++) bag = advanceBag(bag)

    expect(bag.pos).toBe(0)
    // A 20-element permutation repeating by chance is a 1-in-20! event.
    expect(bag.order).not.toEqual(first)
  })
})
