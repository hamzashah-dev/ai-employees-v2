/**
 * The bot vocabulary.
 *
 * A picker, a store or a serialiser needs these names to round-trip a saved avatar, so they
 * live apart from anything that draws. That separation used to exist to keep ~180 KB of WebGL
 * out of a string union; the renderer is now flat SVG and costs nothing, but the split still
 * earns its place — `stores/identity-store` and `utils/identity` both read these types and
 * neither should have to reach into a component.
 */

/**
 * The six silhouettes. Ordered as they should appear in a picker.
 *
 * Down from eight. `cone`, `pill` and `drop` were authored around 3D eye anchors — a cone has
 * a narrow, low face that only reads once it is lit — and they turned to mush drawn flat at
 * roster size. `arch` replaces them, taken from the reference sheet's Product Manager.
 *
 * **Order is load-bearing.** `getIdentity` derives a shape by indexing this array with a hash
 * of the profile name, so reordering repaints every employee. Append, never insert.
 */
export type BotShape = 'round' | 'blob' | 'squircle' | 'hex' | 'cloud' | 'arch'

/**
 * The resting faces, plus the one the product drives rather than the user.
 *
 * `working` is deliberately part of the same union and deliberately absent from
 * `BOT_EYE_STYLES`: it is what an employee wears while a turn is in flight, so a picker must
 * never offer it and a renderer must always be able to draw it.
 */
export type BotEyeStyle = 'glow' | 'visor' | 'happy' | 'sleepy' | 'working'

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
  /** The SVG `fill`. Not a Tailwind class; see the note in `constants`. */
  hex: HexColor
}

/** The full look, as a picker would hand it over. */
export interface BotAvatarLook {
  shape: BotShape
  eyeStyle: BotEyeStyle
  color: BotColorValue
}
