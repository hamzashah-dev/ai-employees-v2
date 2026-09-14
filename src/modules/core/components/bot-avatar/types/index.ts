/**
 * The bot vocabulary.
 *
 * A picker, a store or a serialiser needs these names to round-trip a saved avatar, so they
 * live apart from anything that draws. `stores/identity-store` and `utils/identity` both read
 * these types and neither should have to reach into a component.
 */

/**
 * The nine silhouettes. Ordered as they should appear in a picker.
 *
 * The head is drawn by blobatar, which has ten shapes; the product uses nine of them
 * (everything but `triangle`), so a roster reads as one species with real variety underneath.
 *
 * **Order is load-bearing.** `getIdentity` derives a shape by indexing this array with a hash
 * of the profile name, so reordering repaints every employee. Append, never insert.
 */
export type BotShape =
  | 'round'
  | 'organic'
  | 'boxy'
  | 'capsule'
  | 'nub'
  | 'cloud'
  | 'droplet'
  | 'hexagon'
  | 'sun'

/** One drawable piece of a blobatar body: a path, or one of the circles a capsule or sun adds. */
export type BlobMark =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number }

export type BotColorName =
  | 'leaf'
  | 'rose'
  | 'sky'
  | 'tangerine'
  | 'grape'
  | 'amber'
  | 'sea'
  | 'slate'

/** A literal `#rrggbb` (or `#rgb`). Narrow enough that a stray token string is a type error. */
export type HexColor = `#${string}`

/**
 * What the `color` prop accepts.
 *
 * A palette name is the intended currency — it is what a picker offers and what is worth
 * persisting — but a literal `#rrggbb` is allowed so a caller that already holds a hex (a
 * migrated identity, a theme-derived accent) does not have to reverse it back into a name.
 */
export type BotColorValue = BotColorName | HexColor

export interface BotColor {
  /** Stable key — this is what gets persisted, never the label or the hex. */
  name: BotColorName
  /** Human-readable, for the accessible name of a swatch. */
  label: string
  /** The hue's swatch. Not a Tailwind class; see the note in `constants`. */
  hex: HexColor
}

/**
 * The two tones one hue resolves to: blobatar's own pairing for the hue — a pastel face and
 * a near-black eye harmonised to it.
 */
export interface BotPalette {
  head: HexColor
  eye: HexColor
}

/** An axis-aligned ellipse in frame units. */
export interface Ellipse {
  cx: number
  cy: number
  rx: number
  ry: number
}

/** The full look, as a picker would hand it over. */
export interface BotAvatarLook {
  shape: BotShape
  color: BotColorValue
}
