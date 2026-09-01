import { useCallback, useState } from 'react'
import { IDENTITY_COLORS } from '@/modules/core/constants/identity'
import { useEmployeeIdentity, useDisplayName } from '@/modules/core/hooks/use-identity'
import { useIdentityStore } from '@/modules/core/stores/identity-store'
import { derivedName, identityKey, type MascotShape } from '@/modules/core/utils/identity'
import type { AvatarPropId } from '@/modules/core/constants/avatar-props'

export interface UseIdentityEditorResult {
  displayName: string
  /** The name Hermes would show on its own, used as the input's placeholder. */
  placeholder: string
  shape: MascotShape
  /** The resolved job glyph, so the hero draws the same face the roster does. */
  prop: AvatarPropId | null
  /** The resolved hue, for previewing a shape choice in the employee's own colour. */
  color: `#${string}`
  colorIndex: number
  /** The name being typed. Seeded from the stored override on mount. */
  draftName: string
  setDraftName: (value: string) => void
  /**
   * Writes the drafted name. An empty draft clears the rename rather than storing a blank.
   *
   * Run on blur as well as Enter, which is why it does not close anything: the swatches are
   * the next thing a pointer lands on, and closing on blur would take Reset and Done down
   * with it on the pointer-down half of the very click aimed at them.
   */
  commitName: () => void
  chooseColor: (index: number) => void
  chooseShape: (shape: MascotShape) => void
  /** True once anything about this employee has been customised. */
  isCustomised: boolean
  reset: () => void
}

/**
 * Editing an employee's face and name.
 *
 * All of it is local, and it has to be: there is no Hermes field for any of these. The
 * store's doc comment has the receipts. The one thing that is *not* editable here is the
 * profile slug — renaming the directory would orphan every session row, cron job and MCP
 * config keyed by the old name, and Hermes exposes no rename at all — so a name typed here
 * is a label over the slug rather than a change to it.
 *
 * The colour and shape commit on click; only the name is buffered, because a name is typed
 * a character at a time and writing every keystroke to localStorage would be silly.
 */
export function useIdentityEditor(profile: string): UseIdentityEditorResult {
  const { color, shape, prop } = useEmployeeIdentity(profile)
  const displayName = useDisplayName(profile)
  const setOverride = useIdentityStore((state) => state.setOverride)
  const resetOverride = useIdentityStore((state) => state.resetOverride)
  const override = useIdentityStore((state) => state.overrides[identityKey(profile)])

  /*
   * Seeded once, from whatever was stored when this editor mounted.
   *
   * The dialog that owns it is mounted only while open, so "on mount" is "on open" — there
   * is no stale draft to clear on the way out, and no effect needed to load one on the way
   * in.
   */
  const [draftName, setDraftName] = useState(() => override?.title ?? '')

  const commitName = useCallback(() => {
    setOverride(profile, { title: draftName })
  }, [draftName, profile, setOverride])

  const chooseColor = useCallback(
    (index: number) => setOverride(profile, { colorIndex: index }),
    [profile, setOverride],
  )

  const chooseShape = useCallback(
    (next: MascotShape) => setOverride(profile, { shape: next }),
    [profile, setOverride],
  )

  const reset = useCallback(() => {
    resetOverride(profile)
    setDraftName('')
  }, [profile, resetOverride])

  return {
    displayName,
    placeholder: derivedName(profile),
    shape,
    prop,
    color,
    // The swatch ring follows the *resolved* colour, so an employee with no override still
    // shows which of the eight the hash landed on rather than none of them. `indexOf` against
    // the full palette is right even though an un-overridden colour is drawn from the
    // prop-compatible subset: the subset is a filter of this list, not a reordering, so a hue
    // found there has the same index here.
    colorIndex: IDENTITY_COLORS.indexOf(color),
    draftName,
    setDraftName,
    commitName,
    chooseColor,
    chooseShape,
    isCustomised: override !== undefined,
    reset,
  }
}
