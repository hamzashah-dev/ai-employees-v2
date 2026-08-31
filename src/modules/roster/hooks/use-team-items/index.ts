import { useMemo } from 'react'
import { useGroupStore } from '@/modules/core/stores/group-store'
import { toGroupRow } from '@/modules/core/utils/group-row'
import type { GroupRow } from '@/modules/core/utils/group-row'
import type { RosterEntry } from '../../types'
import { useRoster } from '../use-roster'

/**
 * Team, as one list.
 *
 * §1g: "Groups sort by recency among the bots; nothing pins them to the top."
 * So this is a genuine merge on `activityMs`, not two sections stacked — a room
 * that has been quiet since Tuesday sits below an employee that ran an hour ago,
 * exactly as it would if it were an employee itself.
 *
 * `useRoster` owns the two network queries; this only adds the rooms, which are
 * local and synchronous. A room therefore appears the instant it is created,
 * without waiting for anything to refetch.
 */
export type TeamItem =
  | { kind: 'employee'; key: string; activityMs: number; sortName: string; entry: RosterEntry }
  | { kind: 'group'; key: string; activityMs: number; sortName: string; row: GroupRow }

export interface UseTeamItemsResult {
  items: TeamItem[]
  isLoading: boolean
  errorMessage?: string
  retry: () => void
}

export function useTeamItems(): UseTeamItemsResult {
  const { entries, isLoading, errorMessage, retry } = useRoster()

  /*
   * Select the rooms map, not a derived array. Zustand compares by reference, so
   * a selector that built the rows here would return a fresh array on every store
   * read and re-render the whole sidebar on any unrelated state change.
   */
  const rooms = useGroupStore((state) => state.rooms)

  const items = useMemo(() => {
    const merged: TeamItem[] = entries.map((entry) => ({
      kind: 'employee',
      key: `e:${entry.profile}`,
      activityMs: entry.activityMs,
      sortName: entry.displayName,
      entry,
    }))

    for (const room of Object.values(rooms)) {
      const row = toGroupRow(room)
      merged.push({
        kind: 'group',
        key: `g:${row.id}`,
        activityMs: row.activityMs,
        sortName: row.name,
        row,
      })
    }

    return merged.sort(
      (a, b) => b.activityMs - a.activityMs || a.sortName.localeCompare(b.sortName),
    )
  }, [entries, rooms])

  return { items, isLoading, errorMessage, retry }
}
