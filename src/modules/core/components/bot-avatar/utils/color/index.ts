import { BOT_COLOR_BY_NAME, DEFAULT_BOT_COLOR } from '../../constants'
import type { BotColorValue, HexColor } from '../../types'

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * A palette name or a literal hex, resolved to the hex the renderer wants.
 *
 * Anything unrecognised falls back to the default hue rather than throwing. A bad value from a
 * stale persisted override should cost the user a wrong colour, not a blank avatar.
 */
export const resolveBotColorHex = (color: BotColorValue | undefined): HexColor => {
  if (color && HEX_RE.test(color)) return expandHex(color)
  const named = color ? BOT_COLOR_BY_NAME[color as keyof typeof BOT_COLOR_BY_NAME] : undefined
  return (named ?? BOT_COLOR_BY_NAME[DEFAULT_BOT_COLOR]).hex
}

/** `#abc` → `#aabbcc`, so every downstream consumer can assume six digits. */
const expandHex = (hex: string): HexColor => {
  const lower = hex.toLowerCase()
  if (lower.length !== 4) return `#${lower.slice(1)}`
  const r = lower.slice(1, 2)
  const g = lower.slice(2, 3)
  const b = lower.slice(3, 4)
  return `#${r}${r}${g}${g}${b}${b}`
}

const parseHex = (hex: string): [number, number, number] => {
  const full = expandHex(HEX_RE.test(hex) ? hex : '#000000')
  return [
    parseInt(full.slice(1, 3), 16),
    parseInt(full.slice(3, 5), 16),
    parseInt(full.slice(5, 7), 16),
  ]
}

/**
 * Below this saturation a colour has no hue worth avoiding.
 *
 * The props are illustrations, and several are mostly greys and near-blacks — `command-line`
 * is a dark terminal, `document` a white page. Treating their nominal hue as a collision would
 * rule out body colours for no reason, so a desaturated prop is simply declared compatible
 * with everything.
 */
const MIN_CHROMA = 0.12

/**
 * A colour's hue in degrees, or `null` when it is too grey to have one.
 *
 * This exists for exactly one caller — the body-hue solver in `utils/identity` — which needs
 * to know whether a prop's colours will fight the body it is drawn on. HSL rather than a
 * perceptual space on purpose: the question is "are these two obviously the same colour", and
 * a hue wheel answers it at a fraction of the cost.
 */
export const hueOf = (hex: string): number | null => {
  const [r8, g8, b8] = parseHex(hex)
  const r = r8 / 255
  const g = g8 / 255
  const b = b8 / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return null

  const lightness = (max + min) / 2
  const saturation = delta / (1 - Math.abs(2 * lightness - 1) || 1)
  if (saturation < MIN_CHROMA) return null

  let hue: number
  if (max === r) hue = ((g - b) / delta) % 6
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4

  return ((hue * 60) % 360 + 360) % 360
}

/** Shortest distance between two hues on the wheel, in degrees — always 0…180. */
export const hueSeparation = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}
