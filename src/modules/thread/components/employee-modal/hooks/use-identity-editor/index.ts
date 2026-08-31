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
  isEditing: boolean
  draftName: string
  setDraftName: (value: string) => void
  startEditing: () => void
  /**
   * Writes the drafted name and *stays* in edit mode.
   *
   * This is what the input's blur runs. Closing the tray on blur would take Reset and Done
   * down with it on the pointer-down half of the very click aimed at them, so the click
   * would land on nothing.
   */
  commitName: () => void
  /** Commits and closes. An empty draft clears the rename rather than storing a blank one. */
  finishEditing: () => void
  cancelEditing: () => void
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

  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')

  const startEditing = useCallback(() => {
    setDraftName(override?.title ?? '')
    setIsEditing(true)
  }, [override?.title])

  const commitName = useCallback(() => {
    setOverride(profile, { title: draftName })
  }, [draftName, profile, setOverride])

  const finishEditing = useCallback(() => {
    commitName()
    setIsEditing(false)
  }, [commitName])

  const cancelEditing = useCallback(() => setIsEditing(false), [])

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
    setIsEditing(false)
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
    isEditing,
    draftName,
    setDraftName,
    startEditing,
    commitName,
    finishEditing,
    cancelEditing,
    chooseColor,
    chooseShape,
    isCustomised: override !== undefined,
    reset,
  }
}
