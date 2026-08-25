import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { MASCOT_EYES, MASCOT_PATHS } from '../../constants/identity'
import { getIdentity } from '../../utils/identity'

/**
 * An employee, wherever they appear in a list, thread, card or header.
 *
 * Draws the *same silhouette* as the marketplace card's `AgentBlob`, from the same
 * `getIdentity(profile)`. It used to throw the shape away and render a plain circle for
 * everyone, so the drop you hired off the shelf turned into a generic dot the instant it
 * landed in the sidebar's Team section. A hire should not cost an employee its face.
 *
 * This knowingly departs from the canvas, which draws the roster avatar "28px, full round".
 * The canvas is one desktop artboard and is silent on what happens to a character between
 * the shelf and the roster; the answer here is that it stays the same character.
 *
 * The 120-unit paths are reused as-is rather than re-authored for small sizes. That was
 * checked, not assumed: rendered to a 28px and a 20px canvas and magnified 8x, all four
 * silhouettes stay separable — blob round, drop pointed at the top, triangle a flat-based
 * apex, cloud a lumpy mound on a flat base. A hand-simplified small variant was drawn and
 * compared side by side at both sizes and was not distinguishable from this, so it was not
 * worth the second set of paths to maintain.
 *
 * What does *not* survive the scale is the eye radius. `AgentBlob` draws `r=5` on the 120
 * grid, which is 1.2px inside a 28px box — a smudge. The eyes here are the same `MASCOT_EYES`
 * coordinates at a radius that holds at roster size; the fattened circles were checked against
 * all four paths with `isPointInFill` around their full circumference, so none of them spills
 * off the silhouette it sits on.
 */
interface EmployeeAvatarProps {
  profile: string
  className?: string
}

/** On the 120 grid, so that 28px renders ~1.75px eyes rather than AgentBlob's 1.2px smudge. */
const EYE_RADIUS = 7.5

export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({ profile, className }) => {
  const { color, shape } = getIdentity(profile)
  const eyes = MASCOT_EYES[shape]

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${profile} avatar`}
      className={cn('block size-7 shrink-0', className)}
    >
      <path d={MASCOT_PATHS[shape]} fill={color} />
      <circle cx={eyes.left} cy={eyes.y} r={EYE_RADIUS} fill="rgb(0 0 0 / 0.38)" />
      <circle cx={eyes.right} cy={eyes.y} r={EYE_RADIUS} fill="rgb(0 0 0 / 0.38)" />
    </svg>
  )
}
