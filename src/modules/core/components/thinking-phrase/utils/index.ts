/**
 * The rotation is a shuffled *bag*, not a random pick: every phrase is shown once
 * before any repeats, and a fresh bag never opens with the phrase that just closed the
 * last one. Random picking on 20 phrases flickers between the same two or three often
 * enough to look broken, which is why this bookkeeping exists.
 *
 * Kept out of the component so the cycle can be exercised without fake timers.
 */

export const PHRASES = [
  'Cooking something up',
  'Dilly dallying',
  'Putting things together',
  'Noodling on it',
  'Stirring the pot',
  'Connecting the dots',
  'Shuffling some papers',
  'Rummaging around',
  'Tinkering away',
  'Chewing on that',
  'Rolling up my sleeves',
  'Spinning some gears',
  'Brewing something nice',
  'Dusting off the shelves',
  'Poking around',
  'Fiddling with bits',
  'Mulling it over',
  'Juggling a few things',
  'Herding some thoughts',
  'Scribbling away',
]

export interface PhraseBag {
  /** A shuffled permutation of every phrase index. */
  order: number[]
  /** How far through the current shuffle we have shown. */
  pos: number
}

/**
 * Uniform shuffle of the phrase indices by sorting on random keys. Preferred over an
 * in-place Fisher-Yates only because `noUncheckedIndexedAccess` makes the index swaps
 * noisy; unlike `sort(() => Math.random() - 0.5)` this one is actually unbiased.
 */
const shuffleIndices = (): number[] =>
  PHRASES.map((_, index) => ({ index, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ index }) => index)

/** A fresh bag that cannot open with the phrase the previous bag just closed with. */
const reshuffleAvoiding = (lastShown: number): number[] => {
  const order = shuffleIndices()
  if (order[0] !== lastShown) return order
  return [...order.slice(1), lastShown]
}

export const createBag = (): PhraseBag => ({ order: shuffleIndices(), pos: 0 })

/** Step to the next phrase, reshuffling once the bag is exhausted. */
export const advanceBag = ({ order, pos }: PhraseBag): PhraseBag => {
  const nextPos = pos + 1
  if (nextPos < order.length) return { order, pos: nextPos }
  return { order: reshuffleAvoiding(order[order.length - 1] ?? -1), pos: 0 }
}

export const phraseAt = ({ order, pos }: PhraseBag): string =>
  PHRASES[order[pos] ?? 0] ?? ''
