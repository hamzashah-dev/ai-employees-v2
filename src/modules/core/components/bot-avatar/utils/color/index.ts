import { palette } from 'blobatar'
import { BOT_COLOR_BY_NAME, DEFAULT_BOT_COLOR } from '../../constants'
import type { BotColorValue, BotPalette, HexColor } from '../../types'

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * A palette name or a literal hex, resolved to the hex it stands for.
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

/**
 * A colour's hue in OKLCH, in degrees.
 *
 * Blobatar's `palette(hue)` expects an OKLCH hue, and its ramps are tuned in that space; HSL
 * disagrees with it by up to thirty degrees on blues and purples, which is enough to hand
 * back the wrong family for two of the eight swatches. Blobatar has this conversion but does
 * not export it, so it is the standard sRGB → linear → LMS → OKLab pipeline, written out.
 *
 * A grey has no hue and comes back as 0 rather than NaN, so a caller can always pass it on.
 */
export const oklchHue = (hex: string): number => {
  const full = expandHex(HEX_RE.test(hex) ? hex : '#000000')
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(full.slice(i, i + 2), 16) / 255))

  const l = Math.cbrt(0.4122214708 * r! + 0.5363325363 * g! + 0.0514459929 * b!)
  const m = Math.cbrt(0.2119034982 * r! + 0.6806995451 * g! + 0.1073969566 * b!)
  const s = Math.cbrt(0.0883024619 * r! + 0.2817188376 * g! + 0.6299787005 * b!)

  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  const hue = (Math.atan2(bb, a) * 180) / Math.PI
  return Number.isFinite(hue) ? (hue + 360) % 360 : 0
}

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/**
 * One hue, two tones.
 *
 * The swatch is a *seed*: its hue goes to blobatar's `palette`, which returns the pastel head
 * and dark eye it would draw for that hue, exactly as the library's own render does — this is
 * deliberate rather than passing the swatch through as the face, so a saturated colour choice
 * still lands on the library's own accessible, harmonised pairing.
 */
export const resolveBotPalette = (color: BotColorValue | undefined): BotPalette => {
  const seed = resolveBotColorHex(color)
  const tones = palette(oklchHue(seed))
  const head = tones.head ?? seed
  const eye = tones.eye ?? '#111111'
  return {
    head: asHex(head),
    eye: asHex(eye),
  }
}

const asHex = (value: string): HexColor => (HEX_RE.test(value) ? expandHex(value) : '#000000')
