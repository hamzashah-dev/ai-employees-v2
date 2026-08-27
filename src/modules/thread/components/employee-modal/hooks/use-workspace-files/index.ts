import { useQuery } from '@tanstack/react-query'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'
import { fetchFiles, HermesHttpError } from '@/modules/core/services/hermes/rest'
import { WORKSPACE_DIR } from '../../constants'
import { toWorkspaceFileRows, type WorkspaceFileRow } from '../../utils/workspace-files'

export interface UseWorkspaceFilesResult {
  files: WorkspaceFileRow[]
  isLoading: boolean
  error: Error | null
  /** Absolute path of the directory being listed, once the roster has answered. */
  workspacePath?: string
}

/**
 * The employee's workspace directory.
 *
 * Two calls, in order, because `/api/files` cannot scope itself. `list_managed_files` is
 * `(request, path)` — it takes no `profile`, and FastAPI drops the extra key silently, so
 * `?profile=ad-creator` returns the operating-system home directory with a 200. The only
 * thing Hermes tells us about where an employee lives is `HermesProfile.path` on
 * `GET /api/profiles`, so the roster has to answer before the listing can be asked for.
 * That query is the same `['profiles']` entry the sidebar already holds, so in practice it
 * is a cache read rather than a round trip.
 *
 * A 404 is a normal answer, not a failure: `workspace/` is bootstrapped by `create_profile`
 * (`_PROFILE_DIRS`), so the shipped `default` profile — which predates that — has none.
 * "No files yet" is the truthful rendering of both cases.
 */
export function useWorkspaceFiles(profile: string): UseWorkspaceFilesResult {
  const employee = useEmployeeProfile(profile)
  const root = employee.data?.path
  const workspacePath = root ? `${root}/${WORKSPACE_DIR}` : undefined

  const listing = useQuery({
    queryKey: ['workspace-files', workspacePath],
    queryFn: () => fetchFiles(workspacePath ?? ''),
    enabled: workspacePath !== undefined,
    retry: false,
  })

  const missing =
    listing.error instanceof HermesHttpError && listing.error.status === 404

  return {
    files: missing ? [] : toWorkspaceFileRows(listing.data ?? []),
    isLoading: employee.isPending || (workspacePath !== undefined && listing.isPending),
    error: missing ? null : ((employee.error ?? listing.error) as Error | null),
    workspacePath,
  }
}
