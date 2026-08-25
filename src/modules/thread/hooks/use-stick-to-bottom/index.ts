import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { NEAR_BOTTOM_PX } from '../../constants'

export interface StickToBottom<T extends HTMLElement> {
  /** Attach to the scrolling element. */
  scrollRef: RefObject<T | null>
  /** False once the reader has scrolled away from the newest message. */
  atBottom: boolean
  scrollToBottom: () => void
}

/**
 * Keeps a transcript pinned to its newest message *only while the reader is
 * already there*. Scrolling up is a deliberate act — reading back through a
 * long turn — and an arriving reply must not yank the view away from it. The
 * caller shows a "jump to latest" affordance while `atBottom` is false.
 *
 * `contentKey` must change whenever anything that affects the column's height
 * changes: message count, streamed text length, tool rows. `resetKey` is the
 * thread's identity — when it changes the view jumps to the bottom regardless
 * of where the previous thread was left.
 */
export function useStickToBottom<T extends HTMLElement = HTMLDivElement>(
  contentKey: string,
  resetKey: string,
): StickToBottom<T> {
  const scrollRef = useRef<T | null>(null)
  // Mirrors `atBottom` for the layout effect, which runs before a state update
  // from the scroll handler would be readable.
  const stuckRef = useRef(true)
  const seenContent = useRef<string | null>(null)
  const seenReset = useRef<string | null>(null)
  const [atBottom, setAtBottom] = useState(true)

  const scrollToBottom = useCallback(() => {
    stuckRef.current = true
    setAtBottom(true)
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const onScroll = (): void => {
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight
      const near = distance <= NEAR_BOTTOM_PX
      stuckRef.current = near
      setAtBottom((previous) => (previous === near ? previous : near))
    }

    node.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => node.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (!node) return

    if (seenReset.current !== resetKey) {
      seenReset.current = resetKey
      seenContent.current = contentKey
      stuckRef.current = true
      setAtBottom(true)
      node.scrollTop = node.scrollHeight
      return
    }

    if (seenContent.current === contentKey) return
    seenContent.current = contentKey
    if (stuckRef.current) node.scrollTop = node.scrollHeight
  }, [contentKey, resetKey])

  return { scrollRef, atBottom, scrollToBottom }
}
