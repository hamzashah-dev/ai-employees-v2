import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchFiles, fetchProfiles, HermesHttpError } from '@/modules/core/services/hermes/rest'
import { toDate } from '@/modules/core/utils/time'
import { WORKSPACE_DIR } from '@/modules/core/components/workspace/constants'
import { toWorkspaceFileRows } from '@/modules/core/components/workspace/utils/workspace-files'
import type { WorkspaceFileRow } from '@/modules/core/components/workspace/utils/workspace-files'

export interface RoomDeliverable extends WorkspaceFileRow {
  /** Whose workspace this came from — the only attribution a room can offer. */
  member: string
}

export interface UseRoomDeliverablesResult {
  files: RoomDeliverable[]
  isLoading: boolean
  error: Error | null
}

/**
 * §1e's "Deliverables" list, built the only way it honestly can be.
 *
 * The panel's own copy says it plainly: "Hermes stores nothing per room, so this
 * reads each employee's own workspace and filters by time — the same listing
 * their panel shows." A room has no file store of its own; it is a chat log plus
 * a member list. So this hook does exactly what that sentence promises — one
 * `/api/files` read per member's `workspace/`, newest-first, kept only if it
 * changed after the room opened — rather than inventing a per-room attachments
 * API Hermes does not have.
 *
 * `since` is `GroupRoom.createdAt`. A file a member wrote before this room ever
 * existed is that member's own history, not something this room produced.
 */
export function useRoomDeliverables(
  members: string[],
  since: number,
): UseRoomDeliverablesResult {
  const profiles = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })

  const paths = useMemo(() => {
    const byName = new Map((profiles.data ?? []).map((profile) => [profile.name, profile.path]))
    return members.map((member) => ({
      member,
      workspacePath: byName.get(member) ? `${byName.get(member)}/${WORKSPACE_DIR}` : undefined,
    }))
  }, [members, profiles.data])

  const listings = useQueries({
    queries: paths.map(({ workspacePath }) => ({
      queryKey: ['workspace-files', workspacePath],
      queryFn: () => fetchFiles(workspacePath ?? ''),
      enabled: workspacePath !== undefined,
      retry: false,
    })),
  })

  const files = useMemo(() => {
    const sinceMs = since || 0
    const rows: RoomDeliverable[] = []

    listings.forEach((listing, index) => {
      const member = paths[index]?.member
      if (!member || !listing.data) return
      for (const row of toWorkspaceFileRows(listing.data)) {
        if (row.isDirectory) continue
        const writtenAt = row.timeIso ? toDate(row.timeIso)?.getTime() : undefined
        if (writtenAt !== undefined && writtenAt < sinceMs) continue
        rows.push({ ...row, member })
      }
    })

    return rows.sort((a, b) => (b.timeIso ?? '').localeCompare(a.timeIso ?? ''))
  }, [listings, paths, since])

  const pendingPaths = paths.some((entry) => entry.workspacePath === undefined)
  const isLoading = profiles.isPending || (pendingPaths && profiles.isFetching) || listings.some((listing) => listing.isPending)

  // A member with no `workspace/` yet (404) is "no files from them", not an error.
  const hardError = listings.find(
    (listing) => listing.error && !(listing.error instanceof HermesHttpError && listing.error.status === 404),
  )?.error

  return {
    files,
    isLoading,
    error: (profiles.error ?? hardError ?? null) as Error | null,
  }
}
