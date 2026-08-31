import {
  DEFAULT_IDENTITY_COLOR,
  IDENTITY_COLORS,
  MASCOT_SHAPES,
  isMascotShape,
  type MascotShape,
} from '../constants/identity'
import { AGENT_PROP } from '../constants/avatar-props/assignments'
import {
  MIN_PROP_HUE_SEPARATION,
  PROP_HUE,
  isAvatarPropId,
  type AvatarPropId,
} from '../constants/avatar-props'
import { hueOf, hueSeparation } from '../components/bot-avatar/utils/color'
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
  /** A `#rrggbb`, for an SVG `fill`. */
  color: HexColor
  shape: MascotShape
  /** The job glyph, or `null` for an employee whose job we have no honest basis to name. */
  prop: AvatarPropId | null
  /** Uppercase initials, used where a mark is too small to read. */
  initials: string
}

/**
 * Hues whose distance from a prop's dominant colour clears the legibility floor.
 *
 * Props are multicolour illustrations rather than silhouettes, so unlike a monochrome glyph
 * they can lose against the body they sit on: `bullish` is a green chart and would sink into a
 * green employee, `privacy` a blue shield on a blue one. The prop is drawn directly on the
 * body with no chip or plate behind it, so separation has to come from the hue choice.
 *
 * Returns the whole palette when the prop is unknown, absent, or too desaturated to have a hue
 * worth avoiding — a filter that can empty the palette would be worse than the collision.
 */
export function compatibleColors(prop: AvatarPropId | null): readonly HexColor[] {
  const propHex = prop ? PROP_HUE[prop] : null
  const propHue = propHex ? hueOf(propHex) : null
  if (propHue === null) return IDENTITY_COLORS

  const clear = IDENTITY_COLORS.filter((hex) => {
    const hue = hueOf(hex)
    return hue === null || hueSeparation(hue, propHue) >= MIN_PROP_HUE_SEPARATION
  })
  return clear.length > 0 ? clear : IDENTITY_COLORS
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
  const h = hash(identityKey(profile))
  const prop = resolveProp(profile, override)

  /*
   * Two palettes, and which one applies turns on whether a human chose.
   *
   * The *derived* colour is drawn from the prop-compatible subset, narrowed before the hash
   * indexes it so the result stays deterministic per employee while still being legible
   * against whatever the employee is holding.
   *
   * An *explicit* `colorIndex` indexes the full palette instead. The solver exists to pick a
   * good default, not to overrule a person: the swatch row offers all eight hues, and a user
   * who picks the green one next to a green prop has to get the green one. Indexing the
   * filtered list here would silently hand back a different colour than the swatch they
   * clicked, and the offset would move as their prop changed.
   */
  const palette = override?.colorIndex == null ? compatibleColors(prop) : IDENTITY_COLORS
  const colorIndex = override?.colorIndex ?? h % palette.length

  // An override naming a shape this build no longer draws (a `cone` left in localStorage by
  // the eight-silhouette vocabulary) falls through to the derivation rather than blanking.
  const shape = isMascotShape(override?.shape)
    ? override.shape
    : (MASCOT_SHAPES[(h >>> 8) % MASCOT_SHAPES.length] ?? 'blob')

  return {
    color: palette[Math.abs(colorIndex) % palette.length] ?? DEFAULT_IDENTITY_COLOR,
    shape,
    prop,
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
