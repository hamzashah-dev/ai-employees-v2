import type { FC } from 'react'
import { DownloadIcon } from '@repo/icons/download'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogTitle,
} from '@repo/ui/dialog'
import { managedFileUrl } from '@/modules/core/services/hermes/rest'
import { describeFileKind, formatFileSize } from '../../utils/file-kind'
import type { WorkspaceFileRow } from '../../utils/workspace-files'
import { PreviewPane } from './components/preview-pane'
import { useFilePreview } from './hooks/use-file-preview'

interface FileViewerProps {
  file: WorkspaceFileRow
  onClose: () => void
}

/**
 * One workspace file, filling the window.
 *
 * A second Dialog on top of the employee card rather than a page inside it: the card is
 * 720px wide and a document, an image or a video needs the screen. Radix stacks the two
 * dismissable layers, so Escape closes this one and leaves the card open behind it.
 *
 * **Download is always offered, for every kind, whether or not it can be previewed.** It is
 * a plain `<a download>` at `/api/files/download` — the one route that accepts the session
 * token as a query param, which is what lets a browser-driven download authenticate without
 * a header. Server-streamed, correctly named from the response's `Content-Disposition`, and
 * with no base64 copy in memory; strictly better than anything built on `/api/files/read`.
 */
export const FileViewer: FC<FileViewerProps> = ({ file, onClose }) => {
  const description = describeFileKind(file.name)
  const preview = useFilePreview(
    file.path,
    description.kind,
    file.size,
    description.canPreview,
  )

  const size = formatFileSize(file.size)
  const meta = [description.extension.toUpperCase(), size, file.timeLabel]
    .filter(Boolean)
    .join(' · ')

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="inset-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-primary p-0"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-primary px-5 py-3">
          <div className="flex min-w-0 flex-col">
            <DialogTitle className="truncate text-label-lg text-primary">
              {file.name}
            </DialogTitle>
            <p className="truncate text-label-xs text-tertiary">{meta}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Not a button with an onClick: a real link lets the browser stream the
                response straight to disk and take the filename from the header. */}
            <Button asChild variant="secondary" size="sm">
              <a href={managedFileUrl(file.path)} download={file.name}>
                <DownloadIcon />
                Download
              </a>
            </Button>
            <DialogCloseButton className="rounded-[10px] text-secondary" />
          </div>
        </header>

        {/* Each pane brings its own scroll box — see `PreviewPane`. */}
        <div className="min-h-0 flex-1">
          <PreviewPane name={file.name} description={description} preview={preview} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
