import { describeFileKind } from '@/modules/core/components/workspace/utils/file-kind'
import type { WorkspaceFileRow } from '@/modules/core/components/workspace/utils/workspace-files'
import type { WorkspaceGalleryItem, WorkspaceGalleryTab } from '../../types'

/**
 * §s23's tabs, derived from the same extension table `FileRows` already
 * trusts — image/video/audio is "Media", a folder is "Folders", everything
 * else on disk is "Docs". No fourth bucket: the canvas's Media/Docs/Folders
 * split is exhaustive over what `/api/files` can return.
 */
function tabFor(file: WorkspaceFileRow): WorkspaceGalleryTab {
  if (file.isDirectory) return 'folders'
  const { kind } = describeFileKind(file.name)
  return kind === 'image' || kind === 'video' || kind === 'audio' ? 'media' : 'docs'
}

export function classifyWorkspaceFiles(files: WorkspaceFileRow[]): WorkspaceGalleryItem[] {
  return files.map((file) => ({ ...file, tab: tabFor(file) }))
}
