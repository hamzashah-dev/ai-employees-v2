import '@testing-library/jest-dom/vitest'

/**
 * jsdom ships no `matchMedia`, so the breakpoint hooks would see every query as unmatched and
 * the app would render its below-1280px layout in every test — a sidebar in a closed drawer,
 * for one. This resolves `(min-width: …)` against `window.innerWidth` so a test can pick a
 * viewport by setting it, and defaults to a desktop width.
 */
window.innerWidth = 1440

window.matchMedia = (query: string): MediaQueryList => {
  const min = /\(min-width:\s*(\d+)px\)/.exec(query)
  const matches = min ? window.innerWidth >= Number(min[1]) : false

  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as MediaQueryList
}
