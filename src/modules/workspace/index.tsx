import { useMemo, useState } from 'react'
import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui/dialog'
import { FolderClosedIcon } from '@repo/icons/folder-closed-icon'
import { Spinner } from '@/modules/core/components/spinner'
import { formatFileSize } from '@/modules/core/components/workspace/utils/file-kind'
import { managedFileUrl } from '@/modules/core/services/hermes/rest'
import { MediaTile } from './components/media-tile'
import { useWorkspaceMedia } from './hooks/use-workspace-media'
import type { WorkspaceGalleryTab } from './types'

interface WorkspaceMediaDialogProps {
  open: boolean
  onClose: () => void
  /** The employee whose `workspace/` this browses. */
  profile: string
  /** Display label — falls back to `profile` when the roster has no override. */
  displayName?: string
}

const TABS: { id: WorkspaceGalleryTab; label: string }[] = [
  { id: 'media', label: 'Media' },
  { id: 'docs', label: 'Docs' },
  { id: 'folders', label: 'Folders' },
]

/**
 * §s23 — one employee's workspace, browsable and downloadable.
 *
 * "Workspace media" turned out not to be a workspace-*level* concept once the
 * codebase was checked: there is no cross-employee asset store, no `/media`
 * route, and `sidebar`'s "workspace" pill is the install name, unrelated. What
 * exists — and what the canvas is actually a closer look at — is one
 * employee's `workspace/` directory, which `modules/core/components/workspace`
 * already lists for the panel's Files section. This dialog is that same
 * listing with a grid, tabs and multi-select layered on, not a new backend
 * concept.
 *
 * Download is per-file. `/api/files/download` streams one file; there is no
 * zip/bundle endpoint, so "Download" opens each selected file's own URL
 * rather than promising a single archive Hermes cannot produce.
 */
export const WorkspaceMediaDialog: FC<WorkspaceMediaDialogProps> = ({
  open,
  onClose,
  profile,
  displayName,
}) => {
  const { items, isLoading, error } = useWorkspaceMedia(profile)
  const [tab, setTab] = useState<WorkspaceGalleryTab>('media')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const visible = useMemo(() => items.filter((item) => item.tab === tab), [items, tab])
  const files = useMemo(() => items.filter((item) => !item.isDirectory), [items])
  const totalSize = useMemo(
    () => files.reduce((sum, item) => sum + (item.size ?? 0), 0),
    [files],
  )
  const newest = files[0]?.timeLabel

  const toggle = (path: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  const selectableInTab = visible.filter((item) => !item.isDirectory)
  const allSelected =
    selectableInTab.length > 0 && selectableInTab.every((item) => selected.has(item.path))

  const download = () => {
    for (const item of items) {
      if (!selected.has(item.path)) continue
      const link = document.createElement('a')
      link.href = managedFileUrl(item.path)
      link.download = item.name
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="flex max-h-[80vh] w-[640px] max-w-[90vw] flex-col gap-0 rounded-3xl border-secondary bg-surface p-0">
        <div className="flex items-center justify-between gap-4 border-b border-primary px-5 py-4">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-label-lg font-medium text-primary">
              {displayName ?? profile}&rsquo;s workspace
            </DialogTitle>
            <DialogDescription className="text-label-sm text-tertiary">
              {files.length} file{files.length === 1 ? '' : 's'}
              {totalSize > 0 && ` · ${formatFileSize(totalSize)}`}
              {newest && ` · newest ${newest}`}
            </DialogDescription>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-primary px-5 py-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-label-sm text-secondary hover:bg-fill-variant-hover',
                { 'bg-fill-variant-active text-primary': tab === id },
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="scrollbar-minimal min-h-[240px] flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex items-center gap-2 py-10 text-label-md text-tertiary">
              <Spinner />
              Reading the workspace…
            </div>
          )}

          {!isLoading && error && (
            <p className="py-10 text-label-md text-critical">Could not read this workspace.</p>
          )}

          {!isLoading && !error && visible.length === 0 && (
            <p className="py-10 text-label-md text-tertiary">Nothing here yet.</p>
          )}

          {!isLoading && !error && visible.length > 0 && tab === 'folders' && (
            <ul className="flex flex-col gap-0.5">
              {visible.map((item) => (
                <li
                  key={item.path}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-label-md text-primary"
                >
                  <FolderClosedIcon className="size-5 shrink-0 stroke-[1.125] text-secondary" />
                  {item.name}
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && visible.length > 0 && tab !== 'folders' && (
            <div className="grid grid-cols-4 gap-3">
              {visible.map((item) => (
                <MediaTile
                  key={item.path}
                  item={item}
                  selected={selected.has(item.path)}
                  onToggle={() => toggle(item.path)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-primary px-5 py-3">
          <p className="text-label-sm text-tertiary">
            {selected.size > 0 ? `${selected.size} selected` : 'Nothing selected'}
          </p>
          <div className="flex items-center gap-3">
            {selectableInTab.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSelected((current) => {
                    if (allSelected) {
                      const next = new Set(current)
                      for (const item of selectableInTab) next.delete(item.path)
                      return next
                    }
                    return new Set([...current, ...selectableInTab.map((item) => item.path)])
                  })
                }
                className="text-label-sm text-secondary hover:text-primary"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={selected.size === 0} onClick={download}>
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
