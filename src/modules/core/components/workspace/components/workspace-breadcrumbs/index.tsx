import type { FC } from 'react'
import { ChevronRightIcon } from '@repo/icons/chevron-right'
import type { Crumb } from '../../utils/workspace-path'

interface WorkspaceBreadcrumbsProps {
  crumbs: Crumb[]
  onNavigate: (path: string) => void
}

/**
 * Where in the workspace the listing is, and the way back out.
 *
 * The trail starts at "Workspace" and can never start anywhere else: `buildBreadcrumbs`
 * is given the root and refuses to describe a path outside it, so there is no crumb that
 * climbs above the employee's own directory. That is the boundary the card promises.
 *
 * A `nav` with an ordered list rather than a row of buttons, because the order is the
 * meaning. The last crumb is the current directory and is text, not a control — a link to
 * where you already are is a dead end that looks like a way out.
 */
export const WorkspaceBreadcrumbs: FC<WorkspaceBreadcrumbsProps> = ({
  crumbs,
  onNavigate,
}) => (
  <nav aria-label="Workspace path">
    <ol className="flex flex-wrap items-center gap-0.5">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <li key={crumb.path} className="flex items-center gap-0.5">
            {index > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-tertiary" />}
            {isLast ? (
              <span aria-current="page" className="px-1 text-label-sm text-primary">
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                className="cursor-pointer rounded-md px-1 text-label-sm text-tertiary transition-colors duration-200 ease-linear hover:text-primary"
              >
                {crumb.label}
              </button>
            )}
          </li>
        )
      })}
    </ol>
  </nav>
)
