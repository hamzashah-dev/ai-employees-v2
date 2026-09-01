import { useCallback, useEffect, useState } from 'react'
import type { WorkspaceFileRow } from '../../utils/workspace-files'
import {
  buildBreadcrumbs,
  isWithinWorkspace,
  parentWithinWorkspace,
  type Crumb,
} from '../../utils/workspace-path'
import { useWorkspaceFiles } from '../use-workspace-files'

export interface UseFileBrowserResult {
  files: WorkspaceFileRow[]
  isLoading: boolean
  error: Error | null
  /** Root first, current directory last. One entry means we are at the root. */
  crumbs: Crumb[]
  /** `null` at the root — there is nothing above the workspace to go up to. */
  parent: string | null
  atRoot: boolean
  /** Whether the listing is showing past `VISIBLE_FILES`. Resets on every directory change. */
  expanded: boolean
  onToggleExpanded: () => void
  /** The row whose viewer is open, or `null`. */
  open: WorkspaceFileRow | null
  onOpen: (file: WorkspaceFileRow) => void
  onCloseViewer: () => void
  onNavigate: (path: string) => void
}

/**
 * Where the Files page is and what it is showing.
 *
 * The current directory is held as an absolute path rather than a relative trail, because
 * that is what `/api/files` takes and what every row already carries — deriving one from
 * the other would give two representations of the same place to keep in step.
 *
 * Every navigation goes through `isWithinWorkspace`. The endpoint cannot refuse for us:
 * with no `COMPUTER_DASHBOARD_FILES_ROOT` set it has no root at all and will list any
 * absolute path handed to it, including `..` walked out of the profile. The card promises
 * one employee's workspace, so the boundary is this hook's to hold.
 */
export function useFileBrowser(profile: string): UseFileBrowserResult {
  const [directory, setDirectory] = useState<string | null>(null)
  const [open, setOpen] = useState<WorkspaceFileRow | null>(null)
  const [expanded, setExpanded] = useState(false)

  const listing = useWorkspaceFiles(profile, directory ?? undefined)
  const root = listing.workspacePath
  const current = listing.directoryPath ?? root ?? ''

  /*
   * The roster answers after the first render, so a directory chosen before `root` was
   * known cannot have been range-checked against it. Re-check once it arrives and drop
   * anything that turns out to be outside — otherwise a stale path would survive as a
   * listing of somewhere the card has no business showing.
   */
  useEffect(() => {
    if (root && directory && !isWithinWorkspace(root, directory)) setDirectory(null)
  }, [root, directory])

  const onNavigate = useCallback(
    (path: string) => {
      if (!root || !isWithinWorkspace(root, path)) return
      setDirectory(path === root ? null : path)
      // A new directory is a new list; carrying "See all" across would show a stranger's
      // row count as if the user had asked for it.
      setExpanded(false)
    },
    [root],
  )

  const onOpen = useCallback(
    (file: WorkspaceFileRow) => {
      if (file.isDirectory) {
        onNavigate(file.path)
        return
      }
      setOpen(file)
    },
    [onNavigate],
  )

  const onCloseViewer = useCallback(() => setOpen(null), [])

  return {
    files: listing.files,
    isLoading: listing.isLoading,
    error: listing.error,
    crumbs: root ? buildBreadcrumbs(root, current) : [],
    parent: root ? parentWithinWorkspace(root, current) : null,
    atRoot: !root || current === root,
    expanded,
    onToggleExpanded: () => setExpanded((on) => !on),
    open,
    onOpen,
    onCloseViewer,
    onNavigate,
  }
}
