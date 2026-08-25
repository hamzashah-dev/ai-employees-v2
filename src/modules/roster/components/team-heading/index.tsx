import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@/modules/core/components/icon'

/**
 * A section label, matching chatly's "Projects" / "Recents" headings: sentence
 * case and tertiary, not uppercase and letter-spaced. The `+` opens the
 * marketplace, which is where hiring happens.
 */
export const TeamHeading: FC = () => (
  <div className="flex h-8 items-center justify-between px-3">
    <h2 className="text-label-sm text-[rgb(var(--color-content-primary)/0.5)]">Team</h2>
    <Link
      to="/marketplace"
      aria-label="Hire"
      title="Hire"
      className="flex size-6 items-center justify-center rounded-lg text-[rgb(var(--color-content-primary)/0.5)] transition-colors hover:bg-[rgb(var(--color-fill-variant-hover))] hover:text-[rgb(var(--color-content-primary))]"
    >
      <PlusIcon className="size-4 stroke-[1.2px]" />
    </Link>
  </div>
)
