import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'
import { DEFAULT_BOT_EYE_STYLE, DEFAULT_BOT_SHAPE } from '../../constants'
import { useBotSprite } from '../../hooks/use-bot-sprite'
import type { BotColorValue, BotEyeStyle, BotShape } from '../../types'
import { resolveBotColorHex } from '../../utils/color'
import { BotGlyph } from '../bot-glyph'

/**
 * The 3D bot, as a picture — for every surface that shows more than one avatar.
 *
 * Same shape, same hue, same lights and same shading as the animated `BotAvatar`, because it
 * is literally a frame of it: one shared offscreen renderer bakes each distinct look once and
 * hands back an `<img>`. Thirty of these on screen is thirty image elements and zero WebGL
 * contexts, zero animation loops and zero per-row work.
 *
 * It does not blink and it does not float — a list of thirty idling bots would be a carnival,
 * and the motion is what earns the hero its live context.
 *
 * Until the bake lands (and forever, where there is no WebGL) this draws `BotGlyph`, which is
 * the same silhouette flat. That is a first paint with a real avatar in it, not a skeleton.
 */
interface BotSpriteProps {
  shape?: BotShape
  eyeStyle?: BotEyeStyle
  color?: BotColorValue
  /**
   * The size this will be *displayed* at, in CSS pixels — it picks the bake resolution, it
   * does not set the box. Size the box with `className`. The default is the largest list use
   * in the app, so every avatar surface shares one cached bitmap per look.
   */
  size?: number
  /** Accessible name. `null` for a sprite inside an already-labelled control. */
  label?: string | null
  className?: string
  style?: CSSProperties
}

/** 64px: the marketplace detail header, the biggest place a sprite is drawn. */
export const DEFAULT_SPRITE_DISPLAY_SIZE = 64

export const BotSprite: FC<BotSpriteProps> = ({
  shape = DEFAULT_BOT_SHAPE,
  eyeStyle = DEFAULT_BOT_EYE_STYLE,
  color,
  size = DEFAULT_SPRITE_DISPLAY_SIZE,
  label = 'Bot avatar',
  className,
  style,
}) => {
  const colorHex = resolveBotColorHex(color)
  const src = useBotSprite({ shape, eyeStyle, colorHex, displaySize: size })

  if (!src) {
    return (
      <BotGlyph
        shape={shape}
        eyeStyle={eyeStyle}
        color={colorHex}
        label={label}
        className={className}
        style={style}
      />
    )
  }

  return (
    <img
      src={src}
      // `alt` rather than `aria-label`: on an image the two mean the same thing, and `alt`
      // is the one that also survives the image failing to load.
      alt={label ?? ''}
      draggable={false}
      className={cn('block shrink-0 select-none', className)}
      style={style}
    />
  )
}
