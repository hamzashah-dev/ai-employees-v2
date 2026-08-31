/**
 * The bot, and the vocabulary it is drawn from.
 *
 * There is one renderer now. The module used to export three — a live WebGL `BotAvatar`, a
 * baked `BotSprite` and a flat `BotGlyph` stand-in — and callers had to know which was safe
 * where, because putting the live one in a `map()` exhausted the browser's context budget and
 * blanked avatars at random. `BotMark` is flat SVG at every size, so that hazard is gone along
 * with the machinery that managed it.
 *
 * Callers wanting a *particular employee* should reach for `EmployeeAvatar` instead; this is
 * the presentational leaf underneath it and knows nothing about profiles.
 */
export { BotMark } from './components/bot-mark'
export * from './constants'
export * from './utils/color'
export type * from './types'
