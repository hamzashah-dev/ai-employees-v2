import type { HermesManagedFile } from '@/modules/core/services/hermes/types'
import { formatRosterTime, toDate } from '@/modules/core/utils/time'

export interface WorkspaceFileRow {
  path: string
  name: string
  isDirectory: boolean
  /** Bytes. `null` for a directory — `list_managed_files` sends no size for one. */
  size: number | null
  /** "7:34" today, "Yesterday", a weekday this week, else "Mar 4". */
  timeLabel: string
  timeIso?: string
}

/**
 * The workspace listing, newest first.
 *
 * `/api/files` sorts directories-then-name server-side (`list_managed_files`), so recency
 * has to be applied here. `mtime` is epoch **seconds** as a float — `Path.stat().st_mtime`
 * straight through — which is why it goes through `toDate` rather than `new Date()`.
 *
 * Nothing in the payload says which employee, session or turn wrote a file: the
 * managed-files API is a plain filesystem read and Hermes keeps no authorship index. The
 * only attribution available is the directory itself, which is why the list is scoped to
 * one profile's `workspace/` rather than being labelled per row.
 */
export function toWorkspaceFileRows(
  entries: HermesManagedFile[],
): WorkspaceFileRow[] {
  return entries
    .map((entry) => {
      const date = toDate(entry.mtime)
      return {
        path: entry.path,
        name: entry.name,
        isDirectory: entry.is_directory,
        size: entry.size,
        timeLabel: date ? formatRosterTime(entry.mtime) : '',
        timeIso: date?.toISOString(),
        sortKey: date?.getTime() ?? 0,
      }
    })
    .sort((a, b) => b.sortKey - a.sortKey || a.name.localeCompare(b.name))
    .map(({ sortKey: _sortKey, ...row }) => row)
}
