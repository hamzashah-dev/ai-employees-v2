import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useEmployeeIdentity } from '../../hooks/use-identity'
import { BotMark } from '../bot-avatar'

/**
 * An employee, wherever they appear in a list, thread, card or header.
 *
 * The single entry point for drawing a *particular* profile: it resolves that profile's
 * silhouette, hue and job prop through `useEmployeeIdentity` and hands them to `BotMark`.
 * Every surface in the app goes through here, which is what keeps one employee looking like
 * the same employee in the sidebar, the thread header and the group composer.
 *
 * It used to be a baked sprite because the avatar was a 3D render and a WebGL context per
 * roster row would exhaust the browser's budget. `BotMark` is flat SVG, so there is no context
 * to budget and no bake to wait for — a roster of fifty is fifty inline SVGs.
 *
 * It also used to throw the shape away and draw a plain circle for everyone, so an employee
 * hired off the shelf turned into a generic dot the instant it landed in the sidebar. A hire
 * should not cost an employee its face.
 */
interface EmployeeAvatarProps {
  profile: string
  /**
   * Rendered size in CSS pixels — the box *and* the detail tier, from one number.
   *
   * Deliberately not a `size-*` class in `className`. The tiers are decided from the number,
   * not measured from the rendered box, so a caller that sized it with a class alone would get
   * a 20px avatar still trying to draw a 30-unit prop: an unreadable smudge, and nothing
   * anywhere would report a problem. Making the number the only way to size it means the two
   * cannot drift apart.
   */
  size?: EmployeeAvatarSize
  /** True while this employee has a turn in flight, which switches it to the working face. */
  busy?: boolean
  /** Positioning and spacing only. Sizing goes through `size`. */
  className?: string
}

/**
 * The sizes the product actually uses, and the Tailwind class for each.
 *
 * A closed set rather than an arbitrary number because the class has to be a literal for
 * Tailwind to emit it — `size-${n}` is invisible to the compiler and produces no CSS at all.
 */
const SIZE_CLASS = {
  20: 'size-5',
  24: 'size-6',
  28: 'size-7',
  32: 'size-8',
  36: 'size-9',
  40: 'size-10',
  48: 'size-12',
  72: 'size-18',
} as const

export type EmployeeAvatarSize = keyof typeof SIZE_CLASS

/**
 * 36px.
 *
 * Up from an earlier 28, which the user called "very small". It is the exact height of the
 * two-line name/subtitle block it sits beside in a roster row, so the avatar grows into
 * alignment with the text rather than pushing the row taller.
 */
const DEFAULT_SIZE: EmployeeAvatarSize = 36

export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({
  profile,
  size = DEFAULT_SIZE,
  busy = false,
  className,
}) => {
  const { color, shape, prop } = useEmployeeIdentity(profile)

  return (
    <BotMark
      shape={shape}
      color={color}
      prop={prop}
      size={size}
      busy={busy}
      label={`${profile} avatar`}
      className={cn(SIZE_CLASS[size], className)}
    />
  )
}
