/**
 * Per-employee visual identity.
 *
 * Hermes has no avatar, icon, colour or display-name field anywhere in its profile
 * model — `ProfileInfo` is 15 fields and none of them are visual, and `write_profile_meta`
 * whitelists `profile.yaml` to `description` + `description_auto`, so inventing a key
 * there would be silently dropped. Identity is therefore derived client-side from the one
 * stable thing we have: the profile name.
 *
 * Deterministic, so an employee looks the same on every load and in every component
 * without a shared store. Everything here is **pure**: a user override is passed in by the
 * caller rather than read from storage, which is what makes the derivation testable and
 * lets the override live in one reactive place (`stores/identity-store.ts`).
 */

import {
  DEFAULT_IDENTITY_COLOR,
  IDENTITY_COLORS,
  MASCOT_SHAPES,
  isMascotShape,
  type MascotShape,
} from '../constants/identity'
import type { HexColor } from '../components/bot-avatar/types'
import type { IdentityOverride } from '../types/identity'

export type { MascotShape }

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
export function identityKey(profile: string): string {
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

export interface EmployeeIdentity {
  /** A `#rrggbb`, for an SVG `fill`, an inline style, or a 3D material. */
  color: HexColor
  shape: MascotShape
  /** Uppercase initials, used where a mascot is too small to read. */
  initials: string
}

export function getIdentity(
  profile: string,
  override?: IdentityOverride,
): EmployeeIdentity {
  const h = hash(identityKey(profile))

  const colorIndex = override?.colorIndex ?? h % IDENTITY_COLORS.length
  // An override naming a shape this build no longer draws (a `triangle` left in localStorage
  // by the four-silhouette vocabulary) falls through to the derivation rather than blanking.
  const shape = isMascotShape(override?.shape)
    ? override.shape
    : (MASCOT_SHAPES[(h >>> 8) % MASCOT_SHAPES.length] ?? 'blob')

  return {
    color:
      IDENTITY_COLORS[Math.abs(colorIndex) % IDENTITY_COLORS.length] ?? DEFAULT_IDENTITY_COLOR,
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

/**
 * "ad-creator" -> "Ad Creator". Hermes profile names are slugs, and it stores no
 * human-facing name of its own, so this is the whole naming scheme until the user
 * overrides it.
 */
export function derivedName(profile: string): string {
  return profile
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** The name to print: the user's rename if there is one, otherwise the slug humanised. */
export function toDisplayName(profile: string, override?: IdentityOverride): string {
  return override?.title?.trim() || derivedName(profile)
}
