import type { BotColor, BotColorName, BotEyeStyle, BotShape } from '../types'

/**
 * The bot palette.
 *
 * These are raw hexes on purpose, and it is one of the two places in this app where that is
 * correct: they are never a `className`. They are an SVG `fill`, and there is no token to
 * borrow — the design ramps describe surfaces and text, and an avatar hue is decorative,
 * carrying no semantic role. Nothing may infer state from an avatar's colour.
 *
 * **Eight, and hotter than the eleven that came before.** The old values were tuned as lit 3D
 * materials, where the light rig supplied the depth; drawn flat at the same values they read
 * washed out, because a flat fill has only chroma to work with. Snow, cocoa and cherry are
 * gone: two near-neutrals and a red that fought the props.
 *
 * **Order is load-bearing** — `getIdentity` indexes this array with a hash of the profile
 * name. Appending is safe; reordering repaints every employee in the product.
 *
 * Lower-case on purpose. `resolveBotColorHex` normalises a *literal* hex through `expandHex`,
 * which lower-cases, but returns a *named* colour's hex verbatim — so an upper-case palette
 * makes the same colour render in two different cases depending on which way it was asked
 * for, and any assertion comparing the two silently fails.
 */
export const BOT_COLORS: readonly BotColor[] = [
  { name: 'leaf', label: 'Leaf', hex: '#10b981' },
  { name: 'rose', label: 'Rose', hex: '#ec2c7c' },
  { name: 'sky', label: 'Sky', hex: '#1877f2' },
  { name: 'tangerine', label: 'Tangerine', hex: '#f97316' },
  { name: 'grape', label: 'Grape', hex: '#8b5cf6' },
  { name: 'amber', label: 'Amber', hex: '#fbb614' },
  { name: 'sea', label: 'Sea', hex: '#12c2b4' },
  { name: 'slate', label: 'Slate', hex: '#78849a' },
]

export const BOT_COLOR_BY_NAME: Record<BotColorName, BotColor> = Object.fromEntries(
  BOT_COLORS.map((color) => [color.name, color]),
) as Record<BotColorName, BotColor>

export const BOT_SHAPES: readonly BotShape[] = ['round', 'blob', 'squircle', 'hex', 'cloud', 'arch']

/**
 * What a picker may offer.
 *
 * `working` is a `BotEyeStyle` but not in this list, and that asymmetry is the point: it is
 * driven by whether a turn is in flight, so offering it as a choice would let a user pin their
 * employee into a permanent busy state.
 */
export const BOT_EYE_STYLES: readonly BotEyeStyle[] = ['glow', 'visor', 'happy', 'sleepy']

/** What to call each shape and eye style where a control needs an accessible name. */
export const BOT_SHAPE_LABELS: Record<BotShape, string> = {
  round: 'Round',
  blob: 'Blob',
  squircle: 'Squircle',
  hex: 'Hex',
  cloud: 'Cloud',
  arch: 'Arch',
}

export const BOT_EYE_STYLE_LABELS: Record<BotEyeStyle, string> = {
  glow: 'Glow',
  visor: 'Visor',
  happy: 'Happy',
  sleepy: 'Sleepy',
  working: 'Working',
}

export const DEFAULT_BOT_SHAPE: BotShape = 'round'

/**
 * Vertical capsules, everywhere, on purpose.
 *
 * The reference sheet uses this face on nineteen of its twenty characters; the others are kept
 * because they cost nothing to carry and a picker may yet want them. Nothing surfaces an eye
 * picker today — if that changes, `BOT_EYE_STYLES` is the list to offer.
 */
export const DEFAULT_BOT_EYE_STYLE: BotEyeStyle = 'glow'

export const DEFAULT_BOT_COLOR: BotColorName = 'grape'

/**
 * Hero size in CSS pixels.
 *
 * The old default was sized to earn a WebGL context. Nothing earns a context now — every
 * avatar is one inline SVG — so this is simply the size the identity modal draws at.
 */
export const DEFAULT_BOT_AVATAR_SIZE = 128
