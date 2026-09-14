import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'
import { AVATAR_PROP_GLYPHS, type AvatarPropId } from '@/modules/core/constants/avatar-props'
import type { BotColorValue } from '../../types'
import { layoutBlob } from '../../utils/blob'
import { resolveBotPalette } from '../../utils/color'
import { BotMark } from '../../components/bot-mark'

/**
 * EXPERIMENT — not wired into the product yet, but its placement geometry is locked (see
 * `CAP_REL`/`GLYPH_REL` below). A round `BotMark` with a blank cap PNG (`/avatars/cap-blank.png`,
 * a hand-cleaned cutout of the brief's own render, no logo baked in) laid over it as a real
 * `<img>`, positioned dynamically from blobatar's own head ellipse for the given seed — plus
 * the employee's own job glyph from the existing `AvatarPropId` vocabulary
 * (`AVATAR_PROP_GLYPHS`, the same registry `startup-kit-agent` and every other catalogue agent
 * already resolve a prop through), drawn on the cap's front panel in the employee's own face
 * colour so a blank, colour-neutral cap still reads as *this* employee.
 *
 * Deliberately scoped to `round` only, per the brief: the crop was measured off one render of
 * one silhouette, so nothing here claims to generalise to boxy, capsule or the rest — that is
 * a follow-up, not this component's job.
 *
 * `CAP_REL` and `GLYPH_REL` are locked, not provisional: initially sampled off the reference
 * composite (`Hamza_Shah_..._make_the_cap_abig_bigger_....png`) by finding the face's own
 * visible circle and the cap's silhouette in the same image, both in pixels, expressed as a
 * multiple of the face's own radius so they carry over to any head size — then hand-tuned and
 * settled against `ops-reporter` (its `bar-chart` prop) in the drag-to-place editor at
 * `/dev/cap-editor`. `GLYPH_REL` is the same idea for the logo, expressed as a fraction of the
 * cap's own box rather than the head's, since the glyph sits on the cap, not the face. The
 * icon and the cap's own colouring are still free to change — only the *geometry* is settled.
 */
const CAP_REL = {
  left: -1.097,
  right: 1.255,
  top: -1.471,
  bottom: -0.058,
} as const

const GLYPH_REL = {
  centerX: 0.487,
  centerY: 0.326,
  size: 0.2,
} as const

interface CappedAvatarProps {
  color?: BotColorValue
  seed?: string
  /** The job glyph for the cap's front panel. Omit for an employee whose job we don't know. */
  prop?: AvatarPropId | null
  size?: number
  busy?: boolean
  label?: string | null
  className?: string
  style?: CSSProperties
}

export const CappedAvatarExperiment: FC<CappedAvatarProps> = ({
  color,
  seed,
  prop,
  size = 96,
  busy = false,
  label,
  className,
  style,
}) => {
  const { head } = layoutBlob(seed ?? 'employee', 'round')
  const palette = resolveBotPalette(color)
  const Glyph = prop ? AVATAR_PROP_GLYPHS[prop] : undefined

  const capLeft = head.cx + CAP_REL.left * head.rx
  const capTop = head.cy + CAP_REL.top * head.ry
  const capWidth = (CAP_REL.right - CAP_REL.left) * head.rx
  const capHeight = (CAP_REL.bottom - CAP_REL.top) * head.ry

  const glyphSize = capWidth * GLYPH_REL.size
  const glyphLeft = capLeft + capWidth * GLYPH_REL.centerX - glyphSize / 2
  const glyphTop = capTop + capHeight * GLYPH_REL.centerY - glyphSize / 2

  /**
   * Two stacked cast shadows, not one — sized off `size` rather than a fixed px value, since
   * this draws at everything from a 20px roster row to a 128px hero. `drop-shadow` rather than
   * `box-shadow`: it follows the PNG's actual alpha shape, and because the offset is purely
   * vertical, the shadow only ever escapes past the *bottom* of that shape — the top and sides
   * stay exactly covered by the crisp cap on top of it, so this reads as a shadow the brim
   * casts onto the forehead, not an outline glow around the whole silhouette.
   *
   * One shadow read as a haze, not contact — nothing this small and this blurred ever looks
   * like it's touching anything. A real object resting on a curved surface casts two: a tight,
   * dark line right at the contact edge, and a softer, wider fall-off further out. Composited
   * in that order (contact first, ambient after) so the ambient shadow doesn't wash the sharp
   * line out.
   */
  const shadow = [
    `drop-shadow(0 ${round(size * 0.012)}px ${round(size * 0.01)}px rgba(0,0,0,0.55))`,
    `drop-shadow(0 ${round(size * 0.05)}px ${round(size * 0.06)}px rgba(0,0,0,0.3))`,
  ].join(' ')

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size, ...style }}
    >
      <BotMark
        shape="round"
        color={color}
        seed={seed}
        size={size}
        busy={busy}
        label={label}
        className="absolute inset-0"
      />
      <img
        src="/avatars/cap-blank.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: `${capLeft}%`,
          top: `${capTop}%`,
          width: `${capWidth}%`,
          height: `${capHeight}%`,
          filter: shadow,
        }}
      />
      {Glyph ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${glyphLeft}%`,
            top: `${glyphTop}%`,
            width: `${glyphSize}%`,
            height: `${glyphSize}%`,
            color: palette.eye,
          }}
        >
          <Glyph className="size-full" />
        </div>
      ) : null}
    </div>
  )
}

const round = (n: number) => Math.round(n * 100) / 100
