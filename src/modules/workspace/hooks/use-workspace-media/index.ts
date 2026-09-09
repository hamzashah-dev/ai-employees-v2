import { useMemo } from 'react'
import { useWorkspaceFiles } from '@/modules/core/components/workspace/hooks/use-workspace-files'
import { classifyWorkspaceFiles } from '../../utils/classify-media'
import type { WorkspaceGalleryItem } from '../../types'

export interface UseWorkspaceMediaResult {
  items: WorkspaceGalleryItem[]
  isLoading: boolean
  error: Error | null
}

/**
 * §s23's whole data source: one employee's `workspace/`, the same listing the
 * panel's Files section already reads, split into the gallery's three tabs.
 * There is no separate media API — Hermes' file endpoint is a flat directory
 * read, so "media" is a filter over it, not a different fetch.
 */
export function useWorkspaceMedia(profile: string): UseWorkspaceMediaResult {
  const { files, isLoading, error } = useWorkspaceFiles(profile)
  const items = useMemo(() => classifyWorkspaceFiles(files), [files])
  return { items, isLoading, error }
}
