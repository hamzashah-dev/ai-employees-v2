import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useEmployeeIdentity } from '../../hooks/use-identity'
import { BotSprite } from '../bot-avatar'

/**
 * An employee, wherever they appear in a list, thread, card or header.
 *
 * The same shaded 3D bot the modal shows, baked to a sprite: same shape from the same
 * `useEmployeeIdentity(profile)`, same hue, same happy face, same lights. It is a picture
 * rather than a live canvas because avatars appear dozens at a time and a WebGL context per
 * roster row would exhaust the browser's context budget long before it ran out of frames —
 * one shared offscreen renderer bakes each distinct look once and every row is an `<img>`.
 * `BotSprite` and `utils/bot-baker` have the detail.
 *
 * It does not blink or float. The motion is what earns the modal's hero its live context;
 * thirty idling bots in a sidebar would be a carnival.
 *
 * It used to throw the shape away and render a plain circle for everyone, so the drop you
 * hired off the shelf turned into a generic dot the instant it landed in the sidebar's Team
 * section. A hire should not cost an employee its face. This knowingly departs from the
 * canvas, which draws the roster avatar "28px, full round" — the canvas is one desktop
 * artboard and is silent on what happens to a character between the shelf and the roster.
 */
interface EmployeeAvatarProps {
  profile: string
  className?: string
}

export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({ profile, className }) => {
  const { color, shape } = useEmployeeIdentity(profile)

  return (
    <BotSprite
      shape={shape}
      color={color}
      label={`${profile} avatar`}
      /*
       * 36px, up from 28. The user's words on the 28px version were "very small"; 36 is the
       * exact height of the two-line name/subtitle block it sits beside in a roster row, so
       * the avatar grows into alignment with the text rather than pushing the row taller.
       * Call sites that set their own `size-*` are unaffected.
       */
      className={cn('size-9', className)}
    />
  )
}
