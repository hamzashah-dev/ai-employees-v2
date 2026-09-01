/**
 * The search chord, written the way the platform writes it.
 *
 * In core because two features print it: the sidebar's `Search` row carries it as a badge,
 * and the modal it opens repeats it in its footer. The binding itself lives with the modal
 * (`use-employee-search`) and accepts either modifier regardless of what this says, so a
 * wrong guess costs a glyph rather than a shortcut.
 *
 * `navigator.platform` is deprecated but `userAgentData` is Chromium-only, so the check is
 * the same substring test the rest of the web uses.
 */
export const SEARCH_SHORTCUT_LABEL =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
    ? '⌘K'
    : 'Ctrl K'
