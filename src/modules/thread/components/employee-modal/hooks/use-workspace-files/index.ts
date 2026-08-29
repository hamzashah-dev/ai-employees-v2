import { useQuery } from '@tanstack/react-query'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'
import { fetchFiles, HermesHttpError } from '@/modules/core/services/hermes/rest'
import { WORKSPACE_DIR } from '../../constants'
import { toWorkspaceFileRows, type WorkspaceFileRow } from '../../utils/workspace-files'
import { isWithinWorkspace } from '../../utils/workspace-path'

export interface UseWorkspaceFilesResult {
  files: WorkspaceFileRow[]
  isLoading: boolean
  error: Error | null
  /** Absolute path of the employee's workspace root, once the roster has answered. */
  workspacePath?: string
  /** Absolute path of the directory actually listed — the root unless one was asked for. */
  directoryPath?: string
}

/**
 * One directory of the employee's workspace.
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
 *
 * `directory` descends into a subfolder. It is checked against the workspace root before
 * it is ever sent, because the endpoint has no root of its own to refuse with: `root` and
 * `locked_root` are `null` unless the operator set `COMPUTER_DASHBOARD_FILES_ROOT`, so an
 * out-of-tree path would be listed rather than rejected. Out of tree falls back to the
 * root instead of throwing — a stale path is a navigation bug, not something to show a user
 * an error about.
 */
export function useWorkspaceFiles(
  profile: string,
  directory?: string,
): UseWorkspaceFilesResult {
  const employee = useEmployeeProfile(profile)
  const root = employee.data?.path
  const workspacePath = root ? `${root}/${WORKSPACE_DIR}` : undefined

  const directoryPath =
    workspacePath === undefined
      ? undefined
      : directory && isWithinWorkspace(workspacePath, directory)
        ? directory
        : workspacePath

  const listing = useQuery({
    queryKey: ['workspace-files', directoryPath],
    queryFn: () => fetchFiles(directoryPath ?? ''),
    enabled: directoryPath !== undefined,
    retry: false,
  })

  const missing =
    listing.error instanceof HermesHttpError && listing.error.status === 404

  return {
    files: missing ? [] : toWorkspaceFileRows(listing.data ?? []),
    isLoading: employee.isPending || (directoryPath !== undefined && listing.isPending),
    error: missing ? null : ((employee.error ?? listing.error) as Error | null),
    workspacePath,
    directoryPath,
  }
}
