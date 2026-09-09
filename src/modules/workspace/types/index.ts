import type { WorkspaceFileRow } from '@/modules/core/components/workspace/utils/workspace-files'

/** §s23's three tabs. */
export type WorkspaceGalleryTab = 'media' | 'docs' | 'folders'

export interface WorkspaceGalleryItem extends WorkspaceFileRow {
  /** `isDirectory` rows are always 'folders'; files split on `describeFileKind`. */
  tab: WorkspaceGalleryTab
}
