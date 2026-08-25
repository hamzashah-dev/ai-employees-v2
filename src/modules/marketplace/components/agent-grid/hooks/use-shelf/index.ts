import { useState } from 'react'

/**
 * How many cards a shelf shows before it has to be asked.
 *
 * Six, because the grid tops out at three columns, so six is two whole rows.
 * Whole rows are the point: the page used to show two cards per shelf with the
 * reveal tile beside them, which turned thirteen shelves into a stack of
 * half-empty rows — the single biggest reason the marketplace read as scattered.
 *
 * Change this together with the grid's widest `grid-cols-*` or the page goes
 * ragged again: it only reads as whole rows while it stays a multiple of the
 * column count.
 */
const SHELF_LIMIT = 6

export interface Shelf {
  /** How many of `total` to render. */
  visible: number
  /** What "Show more <n>" counts — 0 hides the pill. */
  hidden: number
  showAll: () => void
}

/**
 * @param unlimited Skip the preview entirely. Set when a search or a category
 * has already narrowed the page: results the user asked for by name should not
 * then be withheld behind a second click.
 */
export function useShelf(total: number, unlimited = false): Shelf {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded || unlimited ? total : Math.min(total, SHELF_LIMIT)

  return { visible, hidden: total - visible, showAll: () => setExpanded(true) }
}
