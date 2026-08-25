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
    all[profile] = { ...all[profile], ...override }
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
  const override = readOverrides()[profile]
  const h = hash(profile)

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
