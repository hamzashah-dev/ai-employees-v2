import { useSyncExternalStore } from 'react'

/**
 * Breakpoint hooks, mirroring imagine-computer-web's `modules/core/hooks/media-query`.
 *
 * The names are all min-width tests, so `useIsTablet()` means "≥768px", not "is a tablet" —
 * and `!useIsDesktopSmall()` is the house idiom for "narrower than the sidebar breakpoint".
 * Kept to the four the AI Employees surfaces actually need.
 *
 * Upstream this wraps `usehooks-ts`; `useSyncExternalStore` does the same job in a few lines
 * and is tear-free, so no dependency is added. The values match the `--breakpoint-*` tokens.
 */
const BREAKPOINTS = {
  tablet: '768px',
  laptop: '1024px',
  'desktop-sm': '1280px',
  desktop: '1440px',
} as const

const useMediaQuery = (query: string): boolean => {
  const [subscribe, getSnapshot] = MATCHERS[query] ?? register(query)
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

type Matcher = [(cb: () => void) => () => void, () => boolean]

/**
 * One MediaQueryList per query, cached at module scope. `useSyncExternalStore` compares the
 * subscribe function by identity, so creating it inline would resubscribe on every render.
 */
const MATCHERS: Record<string, Matcher> = {}

const register = (query: string): Matcher => {
  const list = window.matchMedia(query)
  const matcher: Matcher = [
    (cb) => {
      list.addEventListener('change', cb)
      return () => list.removeEventListener('change', cb)
    },
    () => list.matches,
  ]
  MATCHERS[query] = matcher
  return matcher
}

export const useIsTablet = () => useMediaQuery(`(min-width: ${BREAKPOINTS.tablet})`)
export const useIsLaptop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.laptop})`)
export const useIsDesktopSmall = () =>
  useMediaQuery(`(min-width: ${BREAKPOINTS['desktop-sm']})`)
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.desktop})`)
