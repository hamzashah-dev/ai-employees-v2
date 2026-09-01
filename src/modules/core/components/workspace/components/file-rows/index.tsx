import type { FC } from 'react'
import { ChevronRightIcon } from '@repo/icons/chevron-right'
import { FolderClosedIcon } from '@repo/icons/folder-closed-icon'
import { describeFileKind, formatFileSize } from '../../utils/file-kind'
import type { WorkspaceFileRow } from '../../utils/workspace-files'

interface FileRowsProps {
  files: WorkspaceFileRow[]
  /**
   * Makes every row a button. Absent on Info's three-row preview, which is a summary of a
   * page one click away rather than a second copy of it — a row that navigated from there
   * would leave the user on a different page than the one they aimed at.
   */
  onOpen?: (file: WorkspaceFileRow) => void
}

/**
 * The workspace listing rows, shared by the Files page and Info's three-row preview.
 *
 * One component rather than two copies, because the two lists differ only in length and in
 * whether they are interactive: the preview is `files.slice(0, 3)` of the same data, and a
 * row that drifted between them would make the same file look like two different things a
 * click apart.
 *
 * The glyph is the file's own kind rather than one generic page, because in a workspace the
 * kind is the useful distinction — which of these eight files is the spreadsheet. It comes
 * from the extension, not the payload's `mime_type`, which answers `application/octet-stream`
 * for markdown. See `describeFileKind`.
 */
export const FileRows: FC<FileRowsProps> = ({ files, onOpen }) => (
  <ul className="flex flex-col">
    {files.map((file) => {
      const { icon: KindIcon } = describeFileKind(file.name)
      const size = file.isDirectory ? '' : formatFileSize(file.size)

      const body = (
        <>
          {file.isDirectory ? (
            <FolderClosedIcon className="size-5 shrink-0 stroke-[1.125] text-secondary" />
          ) : (
            <KindIcon className="size-5 shrink-0 text-secondary" />
          )}
          <span className="min-w-0 flex-1 truncate text-left text-label-md text-primary">
            {file.name}
          </span>
          {size && <span className="shrink-0 text-label-xs text-tertiary">{size}</span>}
          <time dateTime={file.timeIso} className="shrink-0 text-label-xs text-tertiary">
            {file.timeLabel}
          </time>
          {onOpen && file.isDirectory && (
            <ChevronRightIcon className="size-4 shrink-0 text-tertiary" />
          )}
        </>
      )

      return (
        <li key={file.path}>
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(file)}
              aria-label={file.isDirectory ? `Open folder ${file.name}` : `Open ${file.name}`}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 ease-linear hover:bg-fill-variant-hover"
            >
              {body}
            </button>
          ) : (
            <div className="flex items-center gap-3 py-2">{body}</div>
          )}
        </li>
      )
    })}
  </ul>
)
