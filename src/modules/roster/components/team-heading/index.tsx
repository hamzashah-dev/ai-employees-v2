import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@repo/icons/plus'
import { ROUTES } from '../../constants'

/**
 * The "Team" section label and its `+`.
 *
 * The `+` **is** hire — it opens the Employees page, which is the catalogue,
 * matching the shipped Recents heading's `+` exactly (24x24, `rounded-xl`,
 * tertiary, 16px glyph).
 */
export const TeamHeading: FC = () => (
  <div className="flex shrink-0 items-center justify-between py-1 pr-3 pl-4">
    <p className="line-clamp-1 text-label-md font-medium text-tertiary">Team</p>
    <Link
      to={ROUTES.EMPLOYEES}
      aria-label="Hire an employee"
      className="flex size-6 items-center justify-center rounded-xl text-tertiary hover:bg-fill-secondary"
    >
      <PlusIcon className="size-4" />
    </Link>
  </div>
)
