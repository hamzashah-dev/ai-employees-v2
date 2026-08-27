import { Suspense, lazy, type CSSProperties, type FC } from 'react'
import {
  DEFAULT_BOT_AVATAR_SIZE,
  DEFAULT_BOT_COLOR,
  DEFAULT_BOT_EYE_STYLE,
  DEFAULT_BOT_SHAPE,
} from './constants'
import type { BotColorValue, BotEyeStyle, BotShape } from './types'
import { BotGlyph } from './components/bot-glyph'

/**
 * A bot, in three dimensions: a floating, breathing, self-blinking head that follows the
 * pointer, in one of eight shapes, four faces and eleven hues.
 *
 * **This is the animated one, and there is one live instance at a time.** Every mount is its
 * own WebGL context, and browsers cap those at roughly sixteen per page before they start
 * dropping the oldest — so a roster of thirty rows rendering this would not merely be slow,
 * it would blank out avatars at random. Do not put it in a `map()`.
 *
 * Everywhere else — roster rows, the thread header, marketplace cards, dashboard lists —
 * uses `BotSprite`, which is the *same bot under the same lights*, baked once through one
 * shared offscreen renderer and drawn as an `<img>`. It just does not move. Both build their
 * scene with `createBotStage`, so the two cannot drift apart into different-looking bots.
 *
 * This component knows nothing about profiles: it is handed a shape and a colour and it
 * draws them. `EmployeeAvatar` is where the deterministic per-profile identity lives.
 *
 * `three` is ~180 KB of the bundle even after tree-shaking, and most sessions never open a
 * surface that shows a bot at hero size, so it is loaded on demand. Until the chunk lands —
 * and wherever there is no WebGL at all — the same bot renders flat, at the same size, from
 * `BotGlyph`, so the surface never opens on an empty box.
 */
interface BotAvatarProps {
  shape?: BotShape
  eyeStyle?: BotEyeStyle
  /** A palette name (`'grape'`) or a literal `#rrggbb`. */
  color?: BotColorValue
  /** Rendered size in CSS pixels. Square; the camera assumes a 1:1 frame. */
  size?: number
  /**
   * The accessible name. There is no profile here to derive one from, so a caller that knows
   * whose avatar this is should say so — `` `${name} avatar` ``.
   */
  label?: string
  /** Pointer-follow and drag-to-spin. Ignored under `prefers-reduced-motion`. */
  interactive?: boolean
  className?: string
}

/** Named exports only, so the lazy import has to construct the default shape itself. */
const BotAvatarCanvas = lazy(() =>
  import('./components/bot-avatar-canvas').then((m) => ({ default: m.BotAvatarCanvas })),
)

export const BotAvatar: FC<BotAvatarProps> = ({
  shape = DEFAULT_BOT_SHAPE,
  eyeStyle = DEFAULT_BOT_EYE_STYLE,
  color = DEFAULT_BOT_COLOR,
  size = DEFAULT_BOT_AVATAR_SIZE,
  label = 'Bot avatar',
  interactive = true,
  className,
}) => {
  const style: CSSProperties = { width: size, height: size }

  return (
    <Suspense
      fallback={
        <BotGlyph
          shape={shape}
          eyeStyle={eyeStyle}
          color={color}
          label={label}
          className={className}
          style={style}
        />
      }
    >
      <BotAvatarCanvas
        shape={shape}
        eyeStyle={eyeStyle}
        color={color}
        label={label}
        interactive={interactive}
        className={className}
        style={style}
      />
    </Suspense>
  )
}

export { BotGlyph } from './components/bot-glyph'
export { BotSprite } from './components/bot-sprite'
export * from './constants'
export type * from './types'
