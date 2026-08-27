import type { BotEyeStyle, BotShape } from '../../types'

/**
 * What identifies one baked sprite.
 *
 * Pure, and separate from the baker, because this is the part that decides how many GPU
 * renders a roster costs. Getting it wrong is not a rendering bug, it is a cache-miss storm,
 * and that is worth testing without a GPU in the room.
 */
export interface BotSpriteVariant {
  shape: BotShape
  eyeStyle: BotEyeStyle
  /** Already resolved to `#rrggbb`. */
  colorHex: string
  /** The size the sprite will be *displayed* at, in CSS pixels. */
  displaySize: number
}

/**
 * How much bigger than its display size a sprite is rendered.
 *
 * 3× covers a 2× DPR screen with headroom, and browsers downscale an `<img>` with a decent
 * filter, so the alternative — baking per device pixel ratio — would double the cache to
 * fix something nobody can see.
 */
export const SPRITE_SUPERSAMPLE = 3

/**
 * The sizes a sprite is ever rendered at, in physical pixels.
 *
 * Snapping to a handful of buckets is the whole point: every current avatar surface (20px
 * grouped message through 64px marketplace card) lands in one bucket, so the cache holds one
 * bitmap per `(shape, eyes, hue)` rather than one per call site. Eight shapes × eleven hues
 * is 88 possible entries and a real roster warms under a dozen of them.
 */
export const SPRITE_BUCKETS: readonly number[] = [96, 192, 384]

/** The smallest bucket that can serve `displaySize` without upscaling. Clamped at the top. */
export const spriteBucketFor = (displaySize: number): number => {
  const wanted = Math.max(1, displaySize) * SPRITE_SUPERSAMPLE
  const largest = SPRITE_BUCKETS[SPRITE_BUCKETS.length - 1] ?? 384
  return SPRITE_BUCKETS.find((bucket) => bucket >= wanted) ?? largest
}

/**
 * The cache key. Two avatars that would render identically must produce the same string, and
 * two that would not must never collide — hence the bucket rather than the raw display size.
 */
export const botSpriteKey = (variant: BotSpriteVariant): string =>
  [
    variant.shape,
    variant.eyeStyle,
    variant.colorHex.toLowerCase(),
    spriteBucketFor(variant.displaySize),
  ].join('|')
