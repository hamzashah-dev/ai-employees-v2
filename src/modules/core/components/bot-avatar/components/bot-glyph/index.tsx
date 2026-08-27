import { useId, type CSSProperties, type FC, type ReactElement } from 'react'
import { cn } from '@repo/ui/cn'
import { DEFAULT_BOT_EYE_STYLE, DEFAULT_BOT_SHAPE } from '../../constants'
import type { BotColorValue, BotEyeStyle, BotShape } from '../../types'
import {
  glyphEyeHex,
  glyphHighlightHex,
  glyphShadeHex,
  resolveBotColorHex,
} from '../../utils/color'

/**
 * The bot as a flat SVG — the same eight silhouettes and four faces, no WebGL.
 *
 * **Not the normal way an avatar is drawn.** Everything with an audience shows the real
 * shaded render: `BotAvatar` live in the modal, `BotSprite` baked everywhere else. This is
 * the stand-in, and it exists for three jobs:
 *
 *  1. what `BotSprite` paints while its bitmap is being baked, and what `BotAvatar` paints
 *     while the `three` chunk downloads, so neither opens on a hole and then jolts;
 *  2. the answer where there is no WebGL context — an old browser, a blocked GPU, a test
 *     renderer — because an avatar that fails to a blank box is worse than a flat one;
 *  3. a picker's option button, where a live 3D preview per swatch is exactly the "a WebGL
 *     context per row" problem the baker exists to avoid.
 *
 * It was briefly the roster's normal rendering and that was wrong — at 28px the prototype's
 * picker icons read as a coloured smudge, which is what the whole 3D exercise was about. The
 * gradient body below is why it is now a passable stand-in rather than a silhouette: it
 * fakes just enough shading that the emissive eye tint reads on ten of the eleven hues,
 * which in turn is what makes the swap to the baked sprite a change in depth, not in face.
 *
 * The paths are the prototype's own 34-unit icons, kept rather than re-derived so the flat
 * and the 3D readings of a shape agree with each other.
 */
interface BotGlyphProps {
  shape?: BotShape
  eyeStyle?: BotEyeStyle
  color?: BotColorValue
  /** Accessible name. Pass `null` for a glyph sitting inside an already-labelled control. */
  label?: string | null
  className?: string
  style?: CSSProperties
}

const bodyElement = (shape: BotShape, fill: string): ReactElement => {
  switch (shape) {
    case 'blob':
      return (
        <path
          d="M17 4c7 0 14 5 13 13 -1 8 -6 13 -13 13 -8 0 -13 -6 -13 -13C4 9 10 4 17 4z"
          fill={fill}
        />
      )
    case 'squircle':
      return <rect x="4" y="4" width="26" height="26" rx="10" fill={fill} />
    case 'pill':
      return <rect x="2" y="9" width="30" height="16" rx="8" fill={fill} />
    case 'cone':
      return <path d="M17 4 L30 28 Q17 33 4 28 Z" fill={fill} />
    case 'hex':
      return <path d="M17 3 L29 10 V24 L17 31 L5 24 V10 Z" fill={fill} />
    case 'cloud':
      return (
        <path
          d="M9 26 a6 6 0 0 1 1-12 a8 8 0 0 1 15-1 a5.5 5.5 0 0 1 1 13z"
          fill={fill}
        />
      )
    case 'drop':
      return <path d="M17 3 C22 11 28 15 28 22 a11 11 0 0 1-22 0 C6 15 12 11 17 3z" fill={fill} />
    case 'round':
    default:
      return <circle cx="17" cy="17" r="13" fill={fill} />
  }
}

const eyesElement = (eyeStyle: BotEyeStyle, fill: string): ReactElement => {
  switch (eyeStyle) {
    case 'happy':
      return (
        // Two upward arcs, centred on 13 and 21 so the pair sits symmetrically about the
        // 34-unit grid's midline, with a 1.6-unit gap that survives being scaled to 20px.
        <g stroke={fill} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M9.8 19 a3.2 3.2 0 0 1 6.4 0" />
          <path d="M17.8 19 a3.2 3.2 0 0 1 6.4 0" />
        </g>
      )
    case 'visor':
      return <rect x="8" y="14.5" width="18" height="5" rx="2.5" fill={fill} />
    case 'sleepy':
      return (
        <g fill={fill}>
          <rect x="9" y="15.4" width="7" height="3" rx="1.5" transform="rotate(-9 12.5 16.9)" />
          <rect x="18" y="15.4" width="7" height="3" rx="1.5" transform="rotate(9 21.5 16.9)" />
        </g>
      )
    case 'glow':
    default:
      return (
        <g fill={fill}>
          <rect x="10" y="14" width="5.5" height="5" rx="2.6" />
          <rect x="18.5" y="14" width="5.5" height="5" rx="2.6" />
        </g>
      )
  }
}

export const BotGlyph: FC<BotGlyphProps> = ({
  shape = DEFAULT_BOT_SHAPE,
  eyeStyle = DEFAULT_BOT_EYE_STYLE,
  color,
  label = 'Bot avatar',
  className,
  style,
}) => {
  const bodyHex = resolveBotColorHex(color)
  // Unique per instance: a roster renders dozens of these and SVG gradient ids are global,
  // so a shared id would have every avatar painted in whichever hue mounted last.
  const gradientId = `bot-glyph-${useId()}`

  return (
    <svg
      viewBox="0 0 34 34"
      className={cn('block shrink-0', className)}
      style={style}
      role={label === null ? 'presentation' : 'img'}
      aria-label={label ?? undefined}
      aria-hidden={label === null ? true : undefined}
    >
      <defs>
        {/*
          The key light in the 3D scene sits up and to the right at (2.6, 3.2, 2.4), so the
          highlight goes there. Two stops of the body's own hue rather than a white overlay,
          which would wash the colour out at the small sizes this is drawn at.
        */}
        <radialGradient id={gradientId} cx="66%" cy="26%" r="88%">
          <stop offset="0%" stopColor={glyphHighlightHex(bodyHex)} />
          <stop offset="52%" stopColor={bodyHex} />
          <stop offset="100%" stopColor={glyphShadeHex(bodyHex)} />
        </radialGradient>
      </defs>
      {bodyElement(shape, `url(#${gradientId})`)}
      {eyesElement(eyeStyle, glyphEyeHex(bodyHex))}
    </svg>
  )
}
