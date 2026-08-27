import type {
  BotColor,
  BotColorName,
  BotEyeAnchor,
  BotEyeStyle,
  BotShape,
} from '../types'

/**
 * The bot palette.
 *
 * These are raw hexes on purpose, and it is the one place in this app where that is correct:
 * they are not Tailwind classes and never reach a `className`. They are fed to a
 * `MeshStandardMaterial`, which takes a colour in linear-sRGB and knows nothing about the
 * token layer. There is also no token to borrow — the design tokens describe surfaces and
 * text, and an avatar hue is decorative, carrying no semantic role. `constants/identity`
 * makes the same call for the flat SVG mascots, for the same reason.
 *
 * Order is the picker order and the persisted order; append rather than reorder.
 */
export const BOT_COLORS: readonly BotColor[] = [
  { name: 'snow', label: 'Snow', hex: '#e8e8ec' },
  { name: 'cocoa', label: 'Cocoa', hex: '#9c6b4a' },
  { name: 'cherry', label: 'Cherry', hex: '#e14d4d' },
  { name: 'tangerine', label: 'Tangerine', hex: '#f07830' },
  { name: 'amber', label: 'Amber', hex: '#eaa63a' },
  { name: 'leaf', label: 'Leaf', hex: '#4fbe6c' },
  { name: 'sea', label: 'Sea', hex: '#33a893' },
  { name: 'sky', label: 'Sky', hex: '#3a8ef0' },
  { name: 'grape', label: 'Grape', hex: '#7c5cff' },
  { name: 'rose', label: 'Rose', hex: '#ec5f9b' },
  { name: 'slate', label: 'Slate', hex: '#8a8a94' },
]

export const BOT_COLOR_BY_NAME: Record<BotColorName, BotColor> = Object.fromEntries(
  BOT_COLORS.map((color) => [color.name, color]),
) as Record<BotColorName, BotColor>

export const BOT_SHAPES: readonly BotShape[] = [
  'round',
  'blob',
  'squircle',
  'pill',
  'cone',
  'hex',
  'cloud',
  'drop',
]

export const BOT_EYE_STYLES: readonly BotEyeStyle[] = ['glow', 'happy', 'visor', 'sleepy']

/** What to call each shape and eye style where a control needs an accessible name. */
export const BOT_SHAPE_LABELS: Record<BotShape, string> = {
  round: 'Round',
  blob: 'Blob',
  squircle: 'Squircle',
  pill: 'Pill',
  cone: 'Cone',
  hex: 'Hex',
  cloud: 'Cloud',
  drop: 'Drop',
}

export const BOT_EYE_STYLE_LABELS: Record<BotEyeStyle, string> = {
  glow: 'Glow',
  happy: 'Happy',
  visor: 'Visor',
  sleepy: 'Sleepy',
}

/**
 * Eye placement per silhouette.
 *
 * Every shape is authored to roughly a unit radius, but they do not put their mass in the
 * same place — a cone has a narrow, low face and a pill a wide, shallow one — so the anchor
 * and the eye scale are tuned per shape rather than derived. `z` is deliberately short of the
 * surface for the shapes that bulge (`hex` is a flat-faced cylinder at 0.48, `round` a full
 * sphere at 0.90): the eyes are solid meshes floating in front, not decals on the body.
 */
export const BOT_EYE_ANCHORS: Record<BotShape, BotEyeAnchor> = {
  round: { x: 0.34, y: 0.16, z: 0.9, scale: 1 },
  blob: { x: 0.34, y: 0.16, z: 0.92, scale: 1 },
  squircle: { x: 0.32, y: 0.14, z: 0.9, scale: 1 },
  pill: { x: 0.42, y: 0.08, z: 0.78, scale: 0.92 },
  cone: { x: 0.24, y: -0.05, z: 0.56, scale: 0.8 },
  hex: { x: 0.32, y: 0.14, z: 0.48, scale: 0.95 },
  cloud: { x: 0.28, y: 0.18, z: 0.6, scale: 0.85 },
  drop: { x: 0.27, y: -0.02, z: 0.66, scale: 0.85 },
}

export const DEFAULT_BOT_SHAPE: BotShape = 'round'

/**
 * Happy eyes, everywhere, on purpose.
 *
 * The other three styles are kept because they are part of the character set and cost
 * nothing to carry, but the product shows one face: a bot that squints happily is the same
 * bot in the roster, the thread header and the modal, and a per-employee eye choice buys
 * variety the shape and the hue already provide. Nothing surfaces an eye picker — if that
 * ever changes, `BOT_EYE_STYLES` is the list to offer.
 */
export const DEFAULT_BOT_EYE_STYLE: BotEyeStyle = 'happy'

export const DEFAULT_BOT_COLOR: BotColorName = 'grape'

/**
 * Hero size in CSS pixels.
 *
 * This component is for one-at-a-time hero surfaces (see the note on `BotAvatar`), so the
 * default is a size that earns a WebGL context rather than a roster thumbnail's 28px.
 */
export const DEFAULT_BOT_AVATAR_SIZE = 128
