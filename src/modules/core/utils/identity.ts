/**
 * Per-employee visual identity.
 *
 * Hermes has no avatar, icon, colour or emoji field anywhere in its profile
 * model — `ProfileInfo` is 15 fields and none of them are visual, and
 * `profile.yaml` is whitelisted to `description` + `description_auto`, so
 * inventing a key there would be silently dropped. Identity is therefore
 * derived client-side from the one stable thing we have: the profile name.
 *
 * Deterministic, so an employee looks the same on every load and in every
 * component without a shared store. A user override is layered on top and kept
 * in localStorage; it is a per-device preference, not synced state.
 */

import {
  IDENTITY_COLORS,
  MASCOT_SHAPES,
  type MascotShape,
} from '../constants/identity'

export type { MascotShape }

const OVERRIDE_KEY = 'employees:identity-overrides'

/**
 * The key the identity is derived from, canonicalised the way Hermes canonicalises a profile
 * name: `normalize_profile_name` in `computer_cli/profiles.py` is `name.strip().lower()`, and
 * `create_profile` runs it before the directory is made.
 *
 * That matters because the two surfaces hash *different strings for the same employee*: a
 * marketplace card is keyed by the catalogue id it POSTs as `name`, a roster row by whatever
 * `GET /api/profiles` hands back afterwards. Without this the two could disagree on shape and
 * colour and the identity would not survive the hire. Today's catalogue ids are already
 * canonical slugs, so this is a guard rather than a live fix — but it is the only thing making
 * that a fact rather than a coincidence.
 */
function identityKey(profile: string): string {
  return profile.trim().toLowerCase()
}

/** FNV-1a. Small, stable across runs, and good enough to spread short names. */
function hash(value: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

interface IdentityOverride {
  colorIndex?: number
  shape?: MascotShape
}

function readOverrides(): Record<string, IdentityOverride> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, IdentityOverride>) : {}
  } catch {
    return {}
  }
}

export function setIdentityOverride(profile: string, override: IdentityOverride): void {
  if (typeof localStorage === 'undefined') return
  try {
    const all = readOverrides()
    const key = identityKey(profile)
    all[key] = { ...all[key], ...override }
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(all))
  } catch {
    // A full or disabled localStorage must not break rendering.
  }
}

export interface EmployeeIdentity {
  /** A resolved `rgb(...)` string, for use in inline style or an SVG `fill`. */
  color: string
  shape: MascotShape
  /** Uppercase initials, used where a mascot is too small to read. */
  initials: string
}

export function getIdentity(profile: string): EmployeeIdentity {
  const key = identityKey(profile)
  const override = readOverrides()[key]
  const h = hash(key)

  const colorIndex = override?.colorIndex ?? h % IDENTITY_COLORS.length
  const shape =
    override?.shape ?? MASCOT_SHAPES[(h >>> 8) % MASCOT_SHAPES.length] ?? 'blob'

  return {
    color: IDENTITY_COLORS[colorIndex % IDENTITY_COLORS.length] ?? IDENTITY_COLORS[0],
    shape,
    initials: toInitials(profile),
  }
}

/** "ad-creator" -> "AC", "chief" -> "CH". */
export function toInitials(profile: string): string {
  const words = profile
    .split(/[-_\s]+/)
    .map((w) => w.trim())
    .filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) {
    return (words[0] ?? '').slice(0, 2).toUpperCase()
  }
  return words
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

/** "ad-creator" -> "Ad Creator". Hermes profile names are slugs. */
export function toDisplayName(profile: string): string {
  return profile
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
