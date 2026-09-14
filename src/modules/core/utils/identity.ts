import {
  DEFAULT_IDENTITY_COLOR,
  IDENTITY_COLORS,
  MASCOT_SHAPES,
  isMascotShape,
  type MascotShape,
} from '../constants/identity'
import { AGENT_PROP } from '../constants/avatar-props/assignments'
import { isAvatarPropId, type AvatarPropId } from '../constants/avatar-props'
import type { HexColor } from '../components/bot-avatar/types'
import type { IdentityOverride } from '../types/identity'

/**
 * Per-employee visual identity.
 *
 * Hermes has no avatar, icon, colour or display-name field anywhere in its profile model —
 * `ProfileInfo` is fifteen fields and none of them are visual, and `write_profile_meta`
 * whitelists `profile.yaml` to `description` + `description_auto`, so inventing a key there
 * would be silently dropped. Identity is therefore derived client-side from the one stable
 * thing we have: the profile name.
 *
 * Deterministic, so an employee looks the same on every load and in every component without a
 * shared store. Everything here is **pure**: a user override is passed in by the caller rather
 * than read from storage, which is what makes the derivation testable and lets the override
 * live in one reactive place (`stores/identity-store.ts`).
 */

export type { MascotShape }

/**
 * The key the identity is derived from, canonicalised the way Hermes canonicalises a profile
 * name: `normalize_profile_name` in `computer_cli/profiles.py` is `name.strip().lower()`, and
 * `create_profile` runs it before the directory is made.
 *
 * That matters because the two surfaces hash *different strings for the same employee*: a
 * marketplace card is keyed by the catalogue id it POSTs as `name`, a roster row by whatever
 * `GET /api/profiles` hands back afterwards. Without this the two could disagree on shape and
 * colour and the identity would not survive the hire.
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
  /** A `#rrggbb` swatch. `BotMark` resolves it to the head and eye tones. */
  color: HexColor
  shape: MascotShape
  /** The job glyph, or `null` for an employee whose job we have no honest basis to name. */
  prop: AvatarPropId | null
  /**
   * What blobatar draws the character from — the canonical key, so a card and a roster row
   * asking for the same employee get the same face, radii, eyes and tilt.
   */
  seed: string
  /** Uppercase initials, used where a mark is too small to read. */
  initials: string
}

/**
 * The prop an employee wears, before any category fallback.
 *
 * Core cannot see the marketplace catalogue — a feature module is off limits from here — so
 * this resolves only what `AGENT_PROP` knows by slug plus the user's own choice. A profile
 * Hermes reports that the catalogue has never heard of gets `null`, and the marketplace layers
 * its category default on top where the category is actually in scope.
 *
 * There is deliberately no hash fallback anywhere in this path. A prop is a claim about what
 * an employee does, and a random claim is worse than none.
 */
export function resolveProp(profile: string, override?: IdentityOverride): AvatarPropId | null {
  if (override?.prop === null) return null
  if (isAvatarPropId(override?.prop)) return override.prop
  return AGENT_PROP[identityKey(profile)] ?? null
}

export function getIdentity(profile: string, override?: IdentityOverride): EmployeeIdentity {
  const seed = identityKey(profile)
  const h = hash(seed)

  /*
   * The colour is a plain hash into the palette, with no legibility solver in front of it.
   * There used to be one: the job prop was a multicolour illustration drawn straight onto the
   * body, so the body hue had to be kept away from the prop's. The prop no longer draws onto
   * the avatar at all — `resolveProp` still resolves it for whatever surface wants a job icon
   * on its own — so nothing constrains the hue any more and it can index the whole palette.
   */
  const colorIndex = override?.colorIndex ?? h % IDENTITY_COLORS.length

  // An override naming a shape this build no longer draws (a `hex` left in localStorage by
  // the six-silhouette vocabulary) falls through to the derivation rather than blanking.
  const shape = isMascotShape(override?.shape)
    ? override.shape
    : (MASCOT_SHAPES[(h >>> 8) % MASCOT_SHAPES.length] ?? 'round')

  return {
    color: IDENTITY_COLORS[Math.abs(colorIndex) % IDENTITY_COLORS.length] ?? DEFAULT_IDENTITY_COLOR,
    shape,
    prop: resolveProp(profile, override),
    seed,
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
 * "ad-creator" -> "Ad Creator". Hermes profile names are slugs, and it stores no human-facing
 * name of its own, so this is the whole naming scheme until the user overrides it.
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
