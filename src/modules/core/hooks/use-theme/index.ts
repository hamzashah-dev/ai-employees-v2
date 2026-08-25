import type { ResolvedTheme, ThemePreference } from '@/modules/core/stores/theme-store'
import { useThemeStore } from '@/modules/core/stores/theme-store'

/**
 * The order one control cycles through. `system` first, because it is the default and the
 * cycle should return to it rather than stranding a user on an explicit choice they made
 * by pressing a button twice.
 */
const CYCLE: readonly ThemePreference[] = ['system', 'light', 'dark']

const LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

interface Theme {
  preference: ThemePreference
  resolved: ResolvedTheme
  /** Human name of the current preference — `System`, not `system`. */
  label: string
  /** Human name of what {@link Theme.cycleTheme} will select next. */
  nextLabel: string
  setTheme: (preference: ThemePreference) => void
  cycleTheme: () => void
}

/**
 * The React-facing view of the theme: the preference the user picked, the theme it resolved
 * to, and the two ways to change it.
 *
 * `preference` and `resolved` differ only on `system`, and both are worth having — the
 * control shows the preference (so `system` stays visible as a state of its own) while
 * anything that has to branch on the actual palette wants the resolved value.
 */
export const useTheme = (): Theme => {
  const preference = useThemeStore((state) => state.preference)
  const resolved = useThemeStore((state) => state.resolved)
  const setTheme = useThemeStore((state) => state.setTheme)

  const next = CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length] ?? 'system'

  return {
    preference,
    resolved,
    label: LABELS[preference],
    nextLabel: LABELS[next],
    setTheme,
    cycleTheme: () => setTheme(next),
  }
}
