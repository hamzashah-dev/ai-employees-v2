import { create } from 'zustand'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'employees:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

const isPreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system'

/**
 * Persisted per device, like the sidebar's collapsed flag and the identity overrides: which
 * theme this browser shows is a property of the machine you are sitting at, not of the
 * account — Hermes has no user record to sync it to in any case.
 */
const read = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isPreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

const write = (preference: ThemePreference): void => {
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Private browsing or disabled storage — losing the preference is fine.
  }
}

/** No `matchMedia` at all (jsdom, non-DOM runtimes) means no signal, so: not dark. */
const systemPrefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(DARK_QUERY).matches

/** The only place the three-value preference collapses to the two themes that exist. */
export const resolveTheme = (
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme => {
  if (preference !== 'system') return preference
  return prefersDark ? 'dark' : 'light'
}

/**
 * `tokens.css` carries the light palette on `:root, .light` and overrides it under `.dark`,
 * so the two classes must never both be set — same specificity, and `.dark` is declared
 * later, so it would win and the page would stay dark. Writing *both* sides of the toggle
 * on every call keeps that invariant whatever the pre-paint script in `index.html` left.
 *
 * `colorScheme` is what carries the choice to the things CSS variables cannot reach: native
 * scrollbars, form controls, and the canvas the browser paints behind the document.
 */
export const applyTheme = (resolved: ResolvedTheme): void => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
  root.style.colorScheme = resolved
}

interface ThemeStore {
  preference: ThemePreference
  resolved: ResolvedTheme
  setTheme: (preference: ThemePreference) => void
}

const initial = read()

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: initial,
  resolved: resolveTheme(initial, systemPrefersDark()),
  setTheme: (preference) => {
    const resolved = resolveTheme(preference, systemPrefersDark())
    write(preference)
    applyTheme(resolved)
    set({ preference, resolved })
  },
}))

/*
 * Bring `<html>` in line at import. Idempotent with the pre-paint script in `index.html`
 * (it writes the same two classes), and it is the whole mechanism when that script is
 * absent. Module scope rather than an effect because the theme has to be right before the
 * first component renders, not one commit later.
 */
applyTheme(useThemeStore.getState().resolved)

/*
 * Someone on `system` who flips their OS at dusk should see the app follow without a reload,
 * so the query stays subscribed for the life of the tab. One global listener, registered
 * here rather than in a hook — no component owns this, and mounting order should not decide
 * whether it works.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
    if (useThemeStore.getState().preference !== 'system') return
    const resolved = resolveTheme('system', event.matches)
    applyTheme(resolved)
    useThemeStore.setState({ resolved })
  })
}
