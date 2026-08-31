import type { FC } from 'react'
import { useTeamItems } from '../../hooks/use-team-items'
import { GroupRow } from '../group-row'
import { RosterEmpty } from '../roster-empty'
import { RosterError } from '../roster-error'
import { RosterRow } from '../roster-row'
import { RosterSkeleton } from '../roster-skeleton'

/**
 * The team list. Owns its own data so the sidebar shell stays a layout.
 * Active state lives on each row's `NavLink`, not on a prop threaded from here.
 *
 * Employees and groups are one interleaved list sorted by recency (§1g), not two
 * sections — see `use-team-items`. The empty state is still keyed on employees:
 * a roster of zero people cannot have a room in it, so "no employees" is always
 * the more useful thing to say.
 */
export const RosterList: FC = () => {
  const { items, isLoading, errorMessage, retry } = useTeamItems()

  if (isLoading) return <RosterSkeleton />
  if (errorMessage) return <RosterError message={errorMessage} onRetry={retry} />
  if (items.length === 0) return <RosterEmpty />

  return (
    <ul aria-label="Team" className="flex flex-col gap-0.5">
      {items.map((item) =>
        item.kind === 'group' ? (
          <GroupRow key={item.key} row={item.row} />
        ) : (
          <RosterRow key={item.key} entry={item.entry} />
        ),
      )}
    </ul>
  )
}
