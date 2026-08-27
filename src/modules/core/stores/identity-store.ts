import { create } from 'zustand'
import type { IdentityOverride } from '../types/identity'
import { identityKey } from '../utils/identity'

const STORAGE_KEY = 'employees:identity-overrides'

/**
 * The user's per-employee avatar, colour and name.
 *
 * **Local only, and deliberately so.** There is no Hermes endpoint behind any of this and
 * there is nowhere to put one: `ProfileInfo` has no visual field, and `write_profile_meta`
 * (`computer_cli/profiles.py`) rewrites `profile.yaml` from a whitelist of `description` +
 * `description_auto`, so a `color:` key added there is dropped by the next description edit.
 * Renaming the profile *directory* is not the same operation — it would break every session
 * row, cron job and MCP config keyed by the old name — so a rename here is a label, not a
 * migration, and the slug stays the identity everywhere the wire is involved.
 *
 * Persisted per device like the theme and the panel width: which face this browser puts on
 * an employee is a property of the machine you are sitting at, and Hermes has no user record
 * to sync it to in any case.
 *
 * Keyed by the *normalised* profile name (`identityKey`), so an override survives the
 * catalogue-id → roster-name round trip a hire makes.
 */

function read(): Record<string, IdentityOverride> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, IdentityOverride>
  } catch {
    // Corrupt JSON or disabled storage — an unstyled roster beats a blank page.
    return {}
  }
}

function write(overrides: Record<string, IdentityOverride>): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // Private browsing or a full quota. Losing the preference must not break an edit.
  }
}

/** Drops keys the user has cleared, so an emptied override stops shadowing the derivation. */
function prune(override: IdentityOverride): IdentityOverride | undefined {
  const next: IdentityOverride = {}
  if (override.colorIndex != null) next.colorIndex = override.colorIndex
  if (override.shape != null) next.shape = override.shape
  if (override.title?.trim()) next.title = override.title.trim()
  return Object.keys(next).length > 0 ? next : undefined
}

interface IdentityStore {
  overrides: Record<string, IdentityOverride>
  /** Merges a patch over whatever this employee already had. */
  setOverride: (profile: string, patch: IdentityOverride) => void
  /** Back to the name-derived colour, shape and title. */
  resetOverride: (profile: string) => void
}

export const useIdentityStore = create<IdentityStore>((set, get) => ({
  overrides: read(),

  setOverride: (profile, patch) => {
    const key = identityKey(profile)
    const merged = prune({ ...get().overrides[key], ...patch })
    const next = { ...get().overrides }
    if (merged) next[key] = merged
    else delete next[key]
    write(next)
    set({ overrides: next })
  },

  resetOverride: (profile) => {
    const next = { ...get().overrides }
    delete next[identityKey(profile)]
    write(next)
    set({ overrides: next })
  },
}))

/**
 * The override for one employee, outside React.
 *
 * The pure helpers in `utils/identity` take an override rather than reading one, so the
 * non-component call sites (search ranking, roster sorting) get it from here.
 */
export function getIdentityOverride(profile: string): IdentityOverride | undefined {
  return useIdentityStore.getState().overrides[identityKey(profile)]
}

export function setIdentityOverride(profile: string, patch: IdentityOverride): void {
  useIdentityStore.getState().setOverride(profile, patch)
}
