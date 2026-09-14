import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { describeFileKind } from '@/modules/core/components/workspace/utils/file-kind'
import { managedFileUrl } from '@/modules/core/services/hermes/rest'
import { localFileName } from '../../utils/local-file'

/**
 * A deliverable named rather than shown.
 *
 * Two jobs: the artifact this app has no inline renderer for (a video, a wav, a pdf), and
 * the image whose `<img>` failed — a file since deleted, or one outside the managed-files
 * root, which answers 403. Both are the honest state: the file has a name and a working
 * download, and the chip says so instead of leaving a broken frame on the page.
 *
 * Only the basename is rendered. The absolute path is the host's filesystem layout, which
 * is exactly what this whole feature exists to keep out of the transcript.
 */

interface MediaChipProps {
  /** Absolute path on the gateway host. */
  path: string
  className?: string
}

export const MediaChip: FC<MediaChipProps> = ({ path, className }) => {
  const name = localFileName(path)
  const { icon: Icon } = describeFileKind(name)

  return (
    <a
      href={managedFileUrl(path)}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'my-1 inline-flex max-w-full items-center gap-2 rounded-xl bg-fill-elevated px-3 py-2 text-label-md text-primary no-underline',
        className,
      )}
    >
      <Icon className="size-4 shrink-0 text-secondary" />
      <span className="truncate">{name}</span>
    </a>
  )
}
