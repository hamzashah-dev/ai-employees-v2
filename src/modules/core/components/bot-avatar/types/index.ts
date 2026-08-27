/**
 * The bot vocabulary — deliberately free of any `three` import.
 *
 * A picker, a store or a serialiser needs these names to round-trip a saved avatar, and none
 * of them should have to pull ~180 KB of WebGL in to read a string union. `three` is imported
 * only from `utils/bot-scene`, `utils/bot-geometry` and the canvas component that owns them,
 * all of which sit behind the lazy boundary in `index.tsx`. Keep it that way.
 */

/** The eight silhouettes. Ordered as they should appear in a picker. */
export type BotShape =
  | 'round'
  | 'blob'
  | 'squircle'
  | 'pill'
  | 'cone'
  | 'hex'
  | 'cloud'
  | 'drop'

/** The four eye treatments. `glow` is the neutral default face. */
export type BotEyeStyle = 'glow' | 'happy' | 'visor' | 'sleepy'

export type BotColorName =
  | 'snow'
  | 'cocoa'
  | 'cherry'
  | 'tangerine'
  | 'amber'
  | 'leaf'
  | 'sea'
  | 'sky'
  | 'grape'
  | 'rose'
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
  /** The 3D material colour. Not a Tailwind class: it is fed to a `MeshStandardMaterial`. */
  hex: HexColor
}

/** The full look, as a picker would hand it over. */
export interface BotAvatarLook {
  shape: BotShape
  eyeStyle: BotEyeStyle
  color: BotColorValue
}

/** Where a shape wants its eyes to sit, in the body's own object space. */
export interface BotEyeAnchor {
  /** Half the gap between the two eyes. */
  x: number
  y: number
  /** How far forward of centre, so the eyes clear the surface they sit on. */
  z: number
  /** Eye scale, because a cone has less face to spend than a sphere does. */
  scale: number
}
