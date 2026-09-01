import { Fragment, type FC } from 'react'
import { cn } from '@repo/ui/cn'
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
 * One row, in any of the three groups: 12px radius, the employee's avatar, the matched
 * line with the query span in `content-primary` against `content-secondary`
 * surroundings, and a right-aligned timestamp.
 *
 * A `subtitle` makes it two lines and the first line solid `content-primary`, which is the
 * resting `Recent` list — there is no query to pick out there, and what the row is for is
 * naming the employee and what it last did. A result row stays one line for the opposite
 * reason: the matched text *is* the content.
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
      <EmployeeAvatar profile={row.profile} size={28} />

      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn('truncate text-label-md', {
            'text-primary': row.subtitle !== undefined,
            'text-secondary': row.subtitle === undefined,
          })}
        >
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
        {row.subtitle && (
          <span className="truncate text-label-sm text-tertiary">{row.subtitle}</span>
        )}
      </span>

      {row.timeLabel && (
        <span className="shrink-0 self-start pt-0.5 text-label-xs text-tertiary">
          {row.timeLabel}
        </span>
      )}
    </button>
  )
}
