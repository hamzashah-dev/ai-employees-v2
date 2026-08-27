import { BOT_COLOR_BY_NAME, DEFAULT_BOT_COLOR } from '../../constants'
import type { BotColorValue, HexColor } from '../../types'

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * A palette name or a literal hex, resolved to the hex the renderer wants.
 *
 * Anything unrecognised falls back to the default hue rather than throwing. This runs inside
 * an animation frame path and on every prop change; a bad value from a stale persisted
 * override should cost the user a wrong colour, not a blank canvas.
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
 * How far the eye glow is pushed toward white from the body colour.
 *
 * The eyes are the body's own hue, not a fixed white, which is what keeps a Cocoa bot warm
 * and a Sea bot cool instead of every bot wearing the same headlights. 0.82 leaves just
 * enough hue to read as a tint.
 */
export const EYE_TINT_MIX = 0.82

/**
 * Mix two hexes, componentwise, in sRGB.
 *
 * Deliberately *not* `Color.lerp`. `three` runs colour management on by default now, so
 * `new Color('#7c5cff')` is already in linear-sRGB and lerping there pushes the midpoint
 * noticeably brighter than the prototype's r128 result, which had no colour management and
 * mixed the raw sRGB bytes. Mixing here and handing the renderer a finished hex keeps the
 * 3D eyes and the flat `BotGlyph` fallback the same colour as each other, and the same
 * colour the prototype had.
 */
export const mixHex = (from: string, to: string, amount: number): HexColor => {
  const a = parseHex(from)
  const b = parseHex(to)
  const t = Math.min(1, Math.max(0, amount))
  const mixed = a.map((channel, i) => Math.round(channel + ((b[i] ?? channel) - channel) * t))
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const parseHex = (hex: string): number[] => {
  const full = expandHex(HEX_RE.test(hex) ? hex : '#000000')
  return [
    parseInt(full.slice(1, 3), 16),
    parseInt(full.slice(3, 5), 16),
    parseInt(full.slice(5, 7), 16),
  ]
}

/** The eye glow for a body colour, as the 3D material emits it. */
export const eyeTintHex = (bodyHex: string): HexColor =>
  mixHex(bodyHex, '#ffffff', EYE_TINT_MIX)

/** Rec. 709 luma, close enough to decide light-or-dark and far cheaper than a real contrast. */
const luminance = (hex: string): number => {
  const [r, g, b] = parseHex(hex)
  return (0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)) / 255
}

/**
 * Where a body is pale enough that a near-white glow disappears into it.
 *
 * This was 0.62 and that was a bug the user saw: Leaf (0.63) and Amber (0.68) are
 * mid-toned hues that should carry the same white arcs the 3D bot has, and instead they
 * came out with dark ones. Only Snow (0.91) is genuinely too pale for the glow, so the
 * threshold sits well clear of every other hue in the palette rather than just above the
 * lightest one it was meant to catch.
 */
const PALE_BODY_LUMINANCE = 0.8

/**
 * The eye colour for the *flat* glyph, which is not always the 3D one.
 *
 * In three dimensions the eyes are emissive at 1.7 and the emissive term is not clamped
 * before tone mapping, so on any hue the eyes clip to white while the lit body sits below
 * it — the separation comes from HDR, not from the colours being different. Flat SVG has no
 * such headroom. The gradient body in `BotGlyph` buys back most of it; Snow is the one hue
 * where it does not, so Snow alone gets dark arcs.
 *
 * Everything else uses the same tint the 3D material emits, which is what makes the swap
 * from glyph to baked sprite a change in shading rather than a change in face.
 */
export const glyphEyeHex = (bodyHex: string): HexColor =>
  luminance(bodyHex) > PALE_BODY_LUMINANCE
    ? mixHex(bodyHex, '#0c0c10', 0.72)
    : eyeTintHex(bodyHex)

/** The lit and shaded ends of the flat glyph's body gradient — a stand-in for real shading. */
export const glyphHighlightHex = (bodyHex: string): HexColor => mixHex(bodyHex, '#ffffff', 0.26)
export const glyphShadeHex = (bodyHex: string): HexColor => mixHex(bodyHex, '#141018', 0.3)
