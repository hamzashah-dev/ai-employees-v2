import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Does this user want animation to stop?
 *
 * `core/hooks/media-query` keeps its `useMediaQuery` private and exports only the four
 * breakpoints, and widening it is not this component's call to make — the avatar is the
 * first thing in the app with a motion preference to honour. If a second consumer appears,
 * promote this into that file rather than copying it again.
 */
const subscribe = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }
  const list = window.matchMedia(QUERY)
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

const getSnapshot = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, () => false)
