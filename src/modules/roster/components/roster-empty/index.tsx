import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'

/** No profiles on disk yet — the marketplace is the only way forward. */
export const RosterEmpty: FC = () => (
  <div className="px-2 py-1.5">
    <p className="text-label-sm text-tertiary">No employees on your team yet.</p>
    <Link
      to={ROUTES.MARKETPLACE}
      className="mt-1.5 inline-block text-label-sm font-medium text-brand hover:text-brand-hover"
    >
      Hire your first employee
    </Link>
  </div>
)
