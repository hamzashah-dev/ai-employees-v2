import type { FC } from 'react'
import { Link } from 'react-router-dom'

/** No profiles on disk yet — the marketplace is the only way forward. */
export const RosterEmpty: FC = () => (
  <div className="px-2.5 py-2">
    <p className="text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">
      No employees on your team yet.
    </p>
    <Link
      to="/marketplace"
      className="mt-1.5 inline-block text-label-sm font-medium text-[rgb(var(--color-brand-soft))] hover:underline"
    >
      Hire your first employee
    </Link>
  </div>
)
