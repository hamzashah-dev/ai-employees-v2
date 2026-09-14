import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'
import { DEFAULT_BOT_SEED, DEFAULT_BOT_SHAPE } from '../../constants'
import type { BotColorValue, BotShape } from '../../types'
import { layoutBlob } from '../../utils/blob'
import { resolveBotPalette } from '../../utils/color'
import { GROUND_MIN_SIZE, VIEW_BOX, groundEllipse } from '../../utils/geometry'

/**
 * An employee, drawn.
 *
 * One inline SVG: a ground shadow, a blobatar head in the employee's hue, and its eyes. That
 * is the whole component — no canvas, no offscreen renderer, no sprite cache, no cap — which
 * is why a fifty-row roster is fifty DOM nodes and costs nothing.
 *
 * The head is blobatar's (`utils/blob`): a deterministic character per `seed`, in nine of its
 * ten silhouettes, drawn at blobatar's own scale so it fills the frame the way the library's
 * own render does — no reserved headroom, because there is nothing sitting above it any more.
 *
 * There used to be a cap here, carrying the job's glyph. It was a distinct visual language
 * from the plain, curated-palette face the product wants now, so it is gone — a clean face is
 * the whole identity, and `useEmployeeIdentity`'s `prop` (the job glyph) still exists for
 * whatever surface asks for a job icon on its own, just not on the avatar.
 *
 * **Presentational and pure.** It is handed a shape, a colour and a seed and it draws them;
 * it reads no store and subscribes to nothing, including the busy state — `busy` arrives as a
 * prop so this stays trivially testable and cannot couple the roster's rendering to the
 * socket. `EmployeeAvatar` is where per-profile identity is resolved.
 */
interface BotMarkProps {
  shape?: BotShape
  /** A palette name (`'grape'`) or a literal `#rrggbb`. */
  color?: BotColorValue
  /**
   * What makes this character *this* character: blobatar varies radii, eye size and tilt by
   * seed. Pass the canonical profile key so the same employee is the same face everywhere.
   */
  seed?: string
  /**
   * Rendered size in CSS pixels. Sizes the element *and* picks the detail tier.
   *
   * It is applied as `width`/`height` on the `<svg>`, so a caller that passes nothing else
   * gets a correctly-sized mark. A `size-*` class in `className` still wins — CSS beats a
   * presentation attribute — which is what lets `GroupClusterAvatar` lay its faces out by
   * class while still declaring a truthful tier here.
   */
  size?: number
  /** True while a turn is in flight, which swaps the resting face for the working one. */
  busy?: boolean
  /** Accessible name. Pass `null` for a mark inside an already-labelled control. */
  label?: string | null
  className?: string
  style?: CSSProperties
}

/**
 * The working face: eyes squinted to just over half height about their own centres.
 *
 * It reads as concentration rather than a different character, which is what keeps a busy
 * employee recognisably the same employee. Applied per eye rather than on the group because
 * the group already carries the blink animation's transform.
 */
const SQUINT = 0.55
const squint = (cy: number) => `translate(0 ${round(cy * (1 - SQUINT))}) scale(1 ${SQUINT})`

export const BotMark: FC<BotMarkProps> = ({
  shape = DEFAULT_BOT_SHAPE,
  color,
  seed = DEFAULT_BOT_SEED,
  size = 36,
  busy = false,
  label = 'Bot avatar',
  className,
  style,
}) => {
  const palette = resolveBotPalette(color)
  const blob = layoutBlob(seed, shape)
  const ground = groundEllipse(blob.head)

  const showGround = size >= GROUND_MIN_SIZE

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
          cx={ground.cx}
          cy={ground.cy}
          rx={ground.rx}
          ry={ground.ry}
          fill={palette.head}
          opacity={ground.opacity}
          data-part="ground"
        />
      ) : null}

      <g fill={palette.head} data-part="body">
        {blob.body.map((mark, i) =>
          mark.kind === 'path' ? (
            <path key={i} d={mark.d} />
          ) : (
            <circle key={i} cx={mark.cx} cy={mark.cy} r={mark.r} />
          ),
        )}
      </g>
      <g
        className="bot-mark-eyes"
        fill={palette.eye}
        data-part="eyes"
        data-face={busy ? 'working' : 'idle'}
      >
        {blob.eyes.map((eye, i) => (
          <path key={i} d={eye.d} transform={busy ? squint(eye.cy) : undefined} />
        ))}
      </g>
    </svg>
  )
}

const round = (n: number) => Math.round(n * 100) / 100
