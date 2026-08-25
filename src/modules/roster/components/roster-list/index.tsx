import type { FC } from 'react'
import { useRoster } from '../../hooks/use-roster'
import { RosterEmpty } from '../roster-empty'
import { RosterError } from '../roster-error'
import { RosterRow } from '../roster-row'
import { RosterSkeleton } from '../roster-skeleton'

/**
 * The team list. Owns its own data so the sidebar shell stays a layout.
 * Active state lives on each row's `NavLink`, not on a prop threaded from here.
 */
export const RosterList: FC = () => {
  const { entries, isLoading, errorMessage, retry } = useRoster()

  if (isLoading) return <RosterSkeleton />
  if (errorMessage) return <RosterError message={errorMessage} onRetry={retry} />
  if (entries.length === 0) return <RosterEmpty />

  return (
    <ul aria-label="Team" className="flex flex-col gap-0.5">
      {entries.map((entry) => (
        <RosterRow key={entry.profile} entry={entry} />
      ))}
    </ul>
  )
}
