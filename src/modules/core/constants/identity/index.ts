import {
  BOT_COLORS,
  BOT_COLOR_BY_NAME,
  BOT_SHAPES,
  BOT_SHAPE_LABELS,
  DEFAULT_BOT_COLOR,
} from '../../components/bot-avatar/constants'
import type { BotColorName, BotShape, HexColor } from '../../components/bot-avatar/types'

/**
 * The employee palette and shape set — one vocabulary, drawn two ways.
 *
 * This used to be six canvas hues and four flat silhouettes. It is now the bot's own
 * eleven hues and eight shapes, because the avatar is the bot: `BotAvatar` renders it in 3D
 * at hero size and `BotGlyph` renders the same shape, hue and face flat at roster size. A
 * second vocabulary alongside it would mean an employee whose identity changed depending on
 * which component was looking at it.
 *
 * The hues are raw hexes rather than `rgb(var(--…))` tokens, and that is not the banned
 * thing: they never reach a `className`. They are an SVG `fill` and a `MeshStandardMaterial`
 * colour, and a material takes a colour, not a CSS custom property it cannot resolve. There
 * is also no token to borrow — the ramps describe surfaces and text, and an avatar hue is
 * decorative and carries no semantic role. Nothing may infer state from an avatar's colour.
 */
export const IDENTITY_COLORS: readonly HexColor[] = BOT_COLORS.map((color) => color.hex)

/**
 * What to call each hue where a swatch has to have an accessible name.
 *
 * Positional, so it stays in step with `IDENTITY_COLORS` by construction rather than by
 * discipline. A colour picker whose options are eleven unlabelled circles is unusable
 * without sight, and the hues are decorative so there is no role to borrow a word from.
 */
export const IDENTITY_COLOR_NAMES: readonly string[] = BOT_COLORS.map((color) => color.label)

/**
 * The same hues, by name.
 *
 * Anything that wants a *particular* colour rather than "the one this employee hashed to"
 * asks for it here. Reaching into `IDENTITY_COLORS` by position would make the palette's
 * order load-bearing, and appending a hue would silently repaint half the marketplace.
 */
export const IDENTITY_COLOR_BY_NAME: Record<BotColorName, HexColor> = Object.fromEntries(
  BOT_COLORS.map((color) => [color.name, color.hex]),
) as Record<BotColorName, HexColor>

/** The hue an unresolvable index falls back to, so a stale override cannot blank an avatar. */
export const DEFAULT_IDENTITY_COLOR: HexColor = BOT_COLOR_BY_NAME[DEFAULT_BOT_COLOR].hex

/**
 * The eight silhouettes.
 *
 * Kept under the `Mascot*` names the rest of the app already calls them by — the bot *is*
 * the mascot, and renaming every call site would be churn for a synonym.
 */
export type MascotShape = BotShape

export const MASCOT_SHAPES: readonly MascotShape[] = BOT_SHAPES

export const MASCOT_SHAPE_NAMES: Record<MascotShape, string> = BOT_SHAPE_LABELS

/**
 * Is this one of the shapes we still draw?
 *
 * Overrides are persisted in `localStorage`, so a browser that saw the four-silhouette
 * vocabulary can hand back a `triangle` that no longer exists. Falling through to the
 * name-derived shape is better than rendering nothing, and better than silently rewriting
 * the user's stored choice.
 */
export const isMascotShape = (value: unknown): value is MascotShape =>
  typeof value === 'string' && (MASCOT_SHAPES as readonly string[]).includes(value)
