import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '../employee-avatar'

/**
 * A group's face: its first three members, stacked.
 *
 * At `sm` the box is 36px — the same footprint `EmployeeAvatar` occupies in a
 * roster row — so a group row and an employee row share a baseline and neither is
 * taller. That parity is the point: §1g is explicit that a group "never invents a
 * signal of its own". `xs` (28px) is the room header's, matching the one-to-one
 * thread header's avatar; `md` (40px) is the create flow's live preview; `lg`
 * (48px) is the room's empty state. Every one of the four is drawn by the canvas —
 * none is interpolated.
 *
 * Three members maximum, whatever the room holds. A fourth face at this size is an
 * unreadable smudge, so the cluster stops at three and the real count is carried
 * in the room header instead.
 *
 * The geometry is lifted from the canvas, not derived. Note the third sprite is
 * **smaller than the other two** — 18 against 20, 24 against 27 — with a 1px lift
 * to match. The canvas draws it that way in all seven clusters, against its own
 * annotation's "each drawn at 20px", and it is what stops the bottom pair reading
 * as a lopsided step. Measured, not eyeballed; do not "fix" it without
 * re-measuring.
 */
const SLOTS = {
  xs: ['top-0 left-1.5 size-4', 'bottom-0 left-0 size-4', 'right-0 bottom-px size-3.5'],
  sm: ['top-0 left-2 size-5', 'bottom-0 left-0 size-5', 'right-0 bottom-px size-4.5'],
  md: [
    'top-0 left-[9px] size-[22px]',
    'bottom-0 left-0 size-[22px]',
    'right-0 bottom-px size-5',
  ],
  lg: [
    'top-0 left-[11px] size-[27px]',
    'bottom-0 left-0 size-[27px]',
    'right-0 bottom-px size-6',
  ],
} as const

const BOX = { xs: 'size-7', sm: 'size-9', md: 'size-10', lg: 'size-12' } as const

/** Read aloud, not printed, so it takes "and" rather than a trailing comma. */
const spokenList = (names: string[]): string =>
  names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

interface GroupClusterAvatarProps {
  /** Profile names in seating order. Only the first three are drawn. */
  members: string[]
  size?: keyof typeof SLOTS
  className?: string
}

export const GroupClusterAvatar: FC<GroupClusterAvatarProps> = ({
  members,
  size = 'sm',
  className,
}) => (
  <span
    role="img"
    aria-label={`Group of ${spokenList(members)}`}
    className={cn('relative block shrink-0', BOX[size], className)}
  >
    {members.slice(0, 3).map((member, index) => (
      <EmployeeAvatar
        key={member}
        profile={member}
        /*
         * The one place the visual size comes from a class rather than from `size`: each
         * face is 14–27px depending on its slot, and `SLOTS` carries that geometry because
         * the third sprite is deliberately smaller than the other two.
         *
         * `size` still has to be told something true, because it picks the detail tier. Every
         * cluster face — the 14px one and the 27px one alike — sits in the same band: below
         * the ground shadow's threshold and below the prop's, so all of them draw a bare body
         * and a face. 20 states that, and the `SLOTS` class that follows wins the merge for
         * the actual box.
         */
        size={20}
        className={cn('absolute', SLOTS[size][index])}
      />
    ))}
  </span>
)
