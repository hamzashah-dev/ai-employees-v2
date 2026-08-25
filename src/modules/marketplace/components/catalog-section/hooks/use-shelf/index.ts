import { useState } from 'react'

/**
 * How many cards a shelf shows before it has to be asked.
 *
 * Two, because the canvas's shelf is exactly one grid row: two cards in columns
 * 1–2 and the "Show more" tile filling columns 3–4. A larger preview would push
 * the tile onto a row of its own, which the canvas never draws.
 */
const SHELF_LIMIT = 2

export interface Shelf {
  /** How many of `total` to render. */
  visible: number
  /** What "Show more <n>" counts — 0 hides the tile. */
  hidden: number
  showAll: () => void
}

export function useShelf(total: number): Shelf {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? total : Math.min(total, SHELF_LIMIT)

  return { visible, hidden: total - visible, showAll: () => setExpanded(true) }
}
