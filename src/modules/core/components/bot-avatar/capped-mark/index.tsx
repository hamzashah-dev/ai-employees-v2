import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'
import { AVATAR_PROP_GLYPHS, type AvatarPropId } from '@/modules/core/constants/avatar-props'
import type { BotColorValue } from '../types'
import { layoutBlob } from '../utils/blob'
import { resolveBotPalette } from '../utils/color'
import { BotMark } from '../components/bot-mark'

/**
 * A round `BotMark` wearing a cap — the sidebar's avatar. A blank cap PNG
 * (`/avatars/cap-blank.png`, a hand-cleaned cutout with no logo baked in, no white fringe left
 * over from its checker background — a plain colour-distance chroma key cannot separate a
 * near-white cap from a near-white checker, so this one specifically was cut with the
 * `hyperframes remove-background` AI segmenter rather than the earlier scripted matte) laid
 * over the head as a real `<img>`, positioned dynamically from blobatar's own head ellipse for
 * the given seed, plus the employee's own job glyph from the existing `AvatarPropId`
 * vocabulary (`AVATAR_PROP_GLYPHS` — the same registry every catalogue agent already resolves
 * a prop through), drawn on the cap's front panel in the employee's own *eye* tone — not the
 * face tone — because the cap is white now: `palette.head` is a pale pastel that all but
 * disappears on white fabric, while `palette.eye` is blobatar's own dark, hue-tinted pairing
 * for the same face, chosen for contrast against it in the first place. Colour-neutral cap,
 * still reads as *this* employee.
 *
 * Deliberately `round`-only: the placement geometry was measured and tuned against one
 * silhouette, so nothing here claims to generalise to boxy, capsule or the rest yet. A caller
 * gets the round head unconditionally, regardless of what shape that profile would otherwise
 * hash to — this *is* the shape now, for whichever surface renders through here.
 *
 * `CAP_REL` and `GLYPH_REL` are locked: sampled off the reference render, then hand-tuned and
 * settled in the drag-to-place editor at `/dev/cap-editor` against `ops-reporter`
 * (`bar-chart`) for the cap's own geometry, and cross-checked against `purchase-clerk`
 * (`package`) for the glyph box, since a taller icon needed slightly more room than a wide one
 * did. The icon and the cap's own colouring are still free to change — only the geometry is
 * settled. `/dev/cap-editor` and `/dev/cap-experiment` stay live for tuning further; keep
 * their copies of these constants in step by hand if either changes (no shared import between
 * the temporary tools and this file, on purpose — a dev-only page should never be a dependency
 * of production code).
 */
export const CAP_REL = {
  left: -1.08,
  right: 1.317,
  top: -1.467,
  bottom: -0.065,
} as const

export const GLYPH_REL = {
  centerX: 0.494,
  centerY: 0.318,
  size: 0.249,
} as const

interface CappedMarkProps {
  /** A palette name (`'grape'`) or a literal `#rrggbb`. */
  color?: BotColorValue
  /**
   * What makes this character *this* character: blobatar varies radii, eye size and tilt by
   * seed. Pass the canonical profile key so the same employee is the same face everywhere.
   */
  seed?: string
  /** The job glyph for the cap's front panel. Omit for an employee whose job we don't know. */
  prop?: AvatarPropId | null
  /** Rendered size in CSS pixels. Sizes the element and the cap/glyph laid over it. */
  size?: number
  /** True while a turn is in flight, which switches to the working face underneath the cap. */
  busy?: boolean
  /** Accessible name. Pass `null` for a mark inside an already-labelled control. */
  label?: string | null
  className?: string
  style?: CSSProperties
}

export const CappedMark: FC<CappedMarkProps> = ({
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
   * One shadow read as a haze, not contact. A real object resting on a curved surface casts
   * two: a tight, dark line right at the contact edge, and a softer, wider fall-off further
   * out — composited contact-first so the ambient shadow doesn't wash the sharp line out.
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
