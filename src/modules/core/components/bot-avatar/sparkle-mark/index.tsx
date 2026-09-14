import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'

/**
 * An employee, as the Chatly design now draws them: a gradient sparkle/blob shape with two
 * white pill eyes, no cap. Ported from Figma (`PGJJP6VlJC1OW9HPryd5Yn`, nodes `30567:200439`
 * / `30567:200261` / `30567:200276`) — three shape-and-colour variants, each a real asset
 * exported from the design (`public/avatars/sparkle-{violet,teal,pink}.png`), not a redrawn
 * approximation: a Figma gradient mesh on an organic blob path has no honest flat-colour or
 * simple-gradient equivalent, so the asset *is* the body, the same way the cap PNG is the cap.
 *
 * Replaces `capped-mark`, per the call that the cap treatment didn't read well. The two eye
 * pills are real elements (not baked into the asset) because their proportions in the source
 * are relative to the blob's own box, not fixed — drawing them separately is what lets one
 * `size` prop scale the whole face consistently instead of baking a fixed pixel ratio into a
 * raster layer.
 *
 * Deliberately no job glyph and no shape/colour choice per employee's identity: the design has
 * three fixed variants, not an open vocabulary, so `seed` picks one of exactly three rather
 * than resolving a silhouette or a hue.
 */
const SPARKLE_VARIANTS = [
  { id: 'violet', src: '/avatars/sparkle-violet.png' },
  { id: 'teal', src: '/avatars/sparkle-teal.png' },
  { id: 'pink', src: '/avatars/sparkle-pink.png' },
] as const

/** FNV-1a — same hash `utils/identity.ts` uses, so the same seed picks the same variant. */
function hash(value: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * `hash(seed) % 3` looked random but wasn't: the FNV prime is ≡ −1 (mod 3), so multiplying by
 * it every step just flips the running mod-3 value's sign, which makes the final result track
 * the seed's *length parity* far more than its content — most of a real roster landed on one
 * of the three variants and a second got almost none. Scaling the full 32-bit hash into `[0,
 * count)` instead reads the whole value rather than its residue under one specific small
 * modulus, so it isn't exposed to that one prime's arithmetic.
 */
const pickIndex = (value: string, count: number): number =>
  Math.min(count - 1, Math.floor((hash(value) / 4_294_967_296) * count))

interface SparkleMarkProps {
  /**
   * What makes this character *this* character: picks one of the three shape/colour variants.
   * Pass the canonical profile key so the same employee is the same face everywhere.
   */
  seed?: string
  /** Rendered size in CSS pixels. Sizes the element and the blob/eyes drawn over it. */
  size?: number
  /** Accessible name. Pass `null` for a mark inside an already-labelled control. */
  label?: string | null
  className?: string
  style?: CSSProperties
}

/**
 * The blob's own footprint within the box, and the eyes' footprint within the blob — both
 * measured off the Figma frame (`30567:200439`'s 34px nominal box: 3×7px pills, 4px gap).
 */
const BLOB_FRACTION = 0.86
const EYE_WIDTH_FRACTION = 3 / 34
const EYE_HEIGHT_FRACTION = 7 / 34
const EYE_GAP_FRACTION = 4 / 34

export const SparkleMark: FC<SparkleMarkProps> = ({
  seed = 'employee',
  size = 36,
  label = 'Employee avatar',
  className,
  style,
}) => {
  const variant =
    SPARKLE_VARIANTS[pickIndex(seed, SPARKLE_VARIANTS.length)] ?? SPARKLE_VARIANTS[0]
  const blobSize = size * BLOB_FRACTION
  const eyeWidth = blobSize * EYE_WIDTH_FRACTION
  const eyeHeight = blobSize * EYE_HEIGHT_FRACTION
  const eyeGap = blobSize * EYE_GAP_FRACTION

  return (
    <div
      role={label === null ? 'presentation' : 'img'}
      aria-label={label ?? undefined}
      aria-hidden={label === null ? true : undefined}
      className={cn('relative flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size, ...style }}
    >
      <img
        src={variant.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto"
        style={{ width: blobSize, height: blobSize }}
      />
      <div
        className="pointer-events-none relative flex items-center"
        style={{ gap: eyeGap }}
      >
        <span className="block rounded-full bg-white" style={{ width: eyeWidth, height: eyeHeight }} />
        <span className="block rounded-full bg-white" style={{ width: eyeWidth, height: eyeHeight }} />
      </div>
    </div>
  )
}
