import { Fragment, type FC } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { highlight } from '../../utils/highlight'
import type { SearchRow } from '../../hooks/use-employee-search'

interface ResultRowProps {
  row: SearchRow
  query: string
  onSelect: (profile: string) => void
}

/**
 * One result, in either group: 12px radius, the employee's avatar, the matched
 * line with the query span in `content-primary` against `content-secondary`
 * surroundings, and a right-aligned timestamp.
 *
 * Every row — message rows included — opens that **employee's thread**, not the
 * message. That is the honest destination, not a shortcut: `SessionManager` binds
 * one session per profile for its whole life (`session.create` is the only place
 * a profile is named; `prompt.submit` takes none), and the gateway exposes no way
 * to open an arbitrary historical session in the thread view. The accessible name
 * says so rather than implying the row jumps to the message. Wiring it properly
 * needs a thread route that takes a session id and a resume path for it.
 */
export const ResultRow: FC<ResultRowProps> = ({ row, query, onSelect }) => {
  const displayName = useDisplayName(row.profile)

  return (
    <button
      type="button"
      onClick={() => onSelect(row.profile)}
      aria-label={`Open ${displayName}’s thread`}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-200 ease-linear hover:bg-fill-variant-hover focus-visible:bg-fill-variant-hover focus-visible:outline-none"
    >
      <EmployeeAvatar profile={row.profile} className="size-7" />

      <span className="min-w-0 flex-1 truncate text-label-md text-secondary">
        {highlight(row.text, query).map((segment, index) => (
          <Fragment key={index}>
            {segment.match ? (
              <span className="text-primary">{segment.text}</span>
            ) : (
              segment.text
            )}
          </Fragment>
        ))}
      </span>

      {row.timeLabel && (
        <span className="shrink-0 text-label-xs text-tertiary">{row.timeLabel}</span>
      )}
    </button>
  )
}
