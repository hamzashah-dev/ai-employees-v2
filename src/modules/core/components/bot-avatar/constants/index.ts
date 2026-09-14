import type { BotColor, BotColorName, BotShape } from '../types'

/**
 * The bot palette.
 *
 * These are raw hexes on purpose, and it is one of the two places in this app where that is
 * correct: they are never a `className`. They seed an SVG `fill`, and there is no token to
 * borrow — the design ramps describe surfaces and text, and an avatar hue is decorative,
 * carrying no semantic role. Nothing may infer state from an avatar's colour.
 *
 * **They are seeds, not fills.** The head is drawn by blobatar, which takes a hue and returns
 * its own harmonised pastel face and dark eye (`resolveBotPalette`). So the swatch a user
 * picks is the *family* — leaf, rose, sky — and the face is that family at blobatar's own,
 * accessible lightness.
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

export const BOT_SHAPES: readonly BotShape[] = [
  'round',
  'organic',
  'boxy',
  'capsule',
  'nub',
  'cloud',
  'droplet',
  'hexagon',
  'sun',
]

/** What to call each shape where a control needs an accessible name. */
export const BOT_SHAPE_LABELS: Record<BotShape, string> = {
  round: 'Round',
  organic: 'Organic',
  boxy: 'Squared',
  capsule: 'Capsule',
  nub: 'Nub',
  cloud: 'Cloud',
  droplet: 'Droplet',
  hexagon: 'Hexagon',
  sun: 'Sun',
}

export const DEFAULT_BOT_SHAPE: BotShape = 'round'

export const DEFAULT_BOT_COLOR: BotColorName = 'grape'

/**
 * The seed a bare `BotMark` draws from.
 *
 * Blobatar varies the character — radii, eye size, tilt — by seed. A mark rendered with no
 * seed (a shape-picker swatch, a story) still needs *a* character, and this one, rather than
 * the empty string, so that a preview looks like a plausible employee rather than the hash of
 * nothing.
 */
export const DEFAULT_BOT_SEED = 'employee'

/**
 * Hero size in CSS pixels.
 *
 * The old default was sized to earn a WebGL context. Nothing earns a context now — every
 * avatar is one inline SVG — so this is simply the size the identity modal draws at.
 */
export const DEFAULT_BOT_AVATAR_SIZE = 128
