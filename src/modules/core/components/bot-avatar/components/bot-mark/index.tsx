import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'
import { AVATAR_PROPS, type AvatarPropId } from '@/modules/core/constants/avatar-props'
import { DEFAULT_BOT_EYE_STYLE, DEFAULT_BOT_SHAPE } from '../../constants'
import type { BotColorValue, BotEyeStyle, BotShape } from '../../types'
import { resolveBotColorHex } from '../../utils/color'
import {
  BODY_PATHS,
  BODY_TRANSFORM,
  EYE_PATHS,
  GROUND_ELLIPSE,
  GROUND_MIN_SIZE,
  PROP_MIN_SIZE,
  PROP_TRANSFORM,
  VIEW_BOX,
} from '../../utils/geometry'

/**
 * An employee, drawn.
 *
 * One inline SVG: a ground shadow, a coloured body, a face, and the job prop over the body's
 * lower right. That is the whole component — no canvas, no offscreen renderer, no sprite
 * cache — which is why a fifty-row roster is fifty DOM nodes and costs nothing.
 *
 * It replaced a `three` pipeline that baked each look through a shared WebGL context. That
 * existed to work around a real limit: browsers cap live contexts at roughly sixteen, so a
 * roster could not render the live component and a baker was the only way to get the same bot
 * into a list. Flat SVG removes the constraint rather than working around it, and took ~1,450
 * lines and a 180 KB dependency with it.
 *
 * **Presentational and pure.** It is handed a shape, a colour and a prop and it draws them; it
 * reads no store and subscribes to nothing, including the busy state — `busy` arrives as a
 * prop so this stays trivially testable and cannot couple the roster's rendering to the
 * socket. `EmployeeAvatar` is where per-profile identity is resolved.
 */
interface BotMarkProps {
  shape?: BotShape
  eyeStyle?: BotEyeStyle
  /** A palette name (`'grape'`) or a literal `#rrggbb`. */
  color?: BotColorValue
  /** The job glyph. Omit for an employee whose job we do not know — never guess one. */
  prop?: AvatarPropId | null
  /**
   * Rendered size in CSS pixels. Sizes the element *and* picks the detail tier.
   *
   * It is applied as `width`/`height` on the `<svg>`, so a caller that passes nothing else
   * gets a correctly-sized mark. A `size-*` class in `className` still wins — CSS beats a
   * presentation attribute — which is what lets `GroupClusterAvatar` lay its faces out by
   * class while still declaring a truthful tier here.
   *
   * The 3D component this replaced set the same dimensions through an inline `style`. Dropping
   * that when the renderer changed left `size` driving the tiers but nothing driving the box,
   * so the one caller that sized purely through `size` — the identity modal's 72px hero —
   * collapsed to zero and took its edit button to the corner of the panel with it.
   */
  size?: number
  /** True while a turn is in flight, which swaps the resting face for the working one. */
  busy?: boolean
  /** Accessible name. Pass `null` for a mark inside an already-labelled control. */
  label?: string | null
  className?: string
  style?: CSSProperties
}

export const BotMark: FC<BotMarkProps> = ({
  shape = DEFAULT_BOT_SHAPE,
  eyeStyle = DEFAULT_BOT_EYE_STYLE,
  color,
  prop,
  size = 36,
  busy = false,
  label = 'Bot avatar',
  className,
  style,
}) => {
  const bodyHex = resolveBotColorHex(color)
  const face: BotEyeStyle = busy ? 'working' : eyeStyle
  const glyph = prop ? AVATAR_PROPS[prop] : undefined

  const showGround = size >= GROUND_MIN_SIZE
  const showProp = size >= PROP_MIN_SIZE && glyph !== undefined

  return (
    <svg
      viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
      width={size}
      height={size}
      className={cn('block shrink-0', className)}
      style={style}
      role={label === null ? 'presentation' : 'img'}
      aria-label={label ?? undefined}
      aria-hidden={label === null ? true : undefined}
    >
      {showGround ? (
        <ellipse
          cx={GROUND_ELLIPSE.cx}
          cy={GROUND_ELLIPSE.cy}
          rx={GROUND_ELLIPSE.rx}
          ry={GROUND_ELLIPSE.ry}
          fill={bodyHex}
          opacity={GROUND_ELLIPSE.opacity}
          data-part="ground"
        />
      ) : null}

      <g transform={BODY_TRANSFORM}>
        <g fill={bodyHex} data-part="body">
          {BODY_PATHS[shape]}
        </g>
        {/*
          `color` as well as `fill`, because the `happy` face strokes rather than fills and
          takes `currentColor`. One wrapper then serves every style without this component
          having to know which of them draws how.

          White on every hue, unlike the 3D bot's tinted glow. That tint existed because an
          emissive material clipped to white in HDR while the lit body sat below it; flat SVG
          has no such headroom, and the palette is saturated enough that plain white separates
          on all eight.
        */}
        <g className="bot-mark-eyes" fill="#ffffff" color="#ffffff" data-part="eyes" data-face={face}>
          {EYE_PATHS[face]}
        </g>
      </g>

      {/*
        The one place raw markup is injected. These bodies are vendored build-time constants
        from our own `constants/avatar-props`, never user input or anything off the wire, so
        there is nothing here to sanitise. `data-prop` exists because jsdom parses SVG
        `innerHTML` into the HTML namespace — a test that queried the injected nodes would be
        asserting on the wrong thing, so it asserts on this attribute instead.
      */}
      {showProp ? (
        <g
          transform={PROP_TRANSFORM}
          data-part="prop"
          data-prop={prop}
          dangerouslySetInnerHTML={{ __html: glyph.body }}
        />
      ) : null}
    </svg>
  )
}
