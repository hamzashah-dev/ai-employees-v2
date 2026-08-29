import type { FC, ReactNode } from 'react'
import type { PropsWithChildren } from '@repo/types/common'
import { cn } from '@repo/ui/cn'
import { Spinner } from '@/modules/core/components/spinner'
import { MarkdownBody } from '../../../../../employee-message/components/markdown-body'
import type { FileKindDescription } from '../../../../utils/file-kind'
import type { UseFilePreviewResult } from '../../hooks/use-file-preview'

interface PreviewPaneProps {
  name: string
  description: FileKindDescription
  preview: UseFilePreviewResult
}

/**
 * The body of the viewer — one pane per kind of file, and an honest state for the rest.
 *
 * There is no generic "preview" fallback on purpose. A kind this app cannot render says so
 * and names the missing piece, because a blank frame or a wall of decoded binary reads as a
 * broken viewer rather than as an absent renderer, and the download beside it works either
 * way.
 *
 * Each pane owns its own scroll box, because the two shapes want opposite things. A picture
 * or a message belongs in the middle of the window; a document belongs at its first line —
 * centring a long README opens it halfway down, which reads as a broken scroll position
 * rather than as a centred layout.
 */
export const PreviewPane: FC<PreviewPaneProps> = ({ name, description, preview }) => {
  const { kind, canPreview, cannotPreviewReason, icon: Icon } = description

  if (!canPreview) {
    return (
      <Unavailable
        title={
          description.extension
            ? `No preview for .${description.extension} here`
            : 'No preview for this file here'
        }
        detail={cannotPreviewReason ?? ''}
        icon={<Icon className="size-8 text-tertiary" />}
      />
    )
  }

  if (preview.problem) {
    return (
      <Unavailable
        title="This one cannot be shown"
        detail={preview.problem}
        icon={<Icon className="size-8 text-tertiary" />}
      />
    )
  }

  if (preview.isLoading) {
    return (
      <Centered>
        <p role="status" className="flex items-center gap-2 text-label-md text-tertiary">
          <Spinner className="size-4" />
          Reading {name}
        </p>
      </Centered>
    )
  }

  if (kind === 'image' && preview.src) {
    return (
      <Centered>
        <img
          src={preview.src}
          alt={name}
          className="max-h-full max-w-full rounded-xl object-contain"
        />
      </Centered>
    )
  }

  if (kind === 'video' && preview.src) {
    /* `controls` and nothing else: autoplay on a file the user opened deliberately is a
       jump-scare, and the endpoint answers Range so the scrubber is real. */
    return (
      <Centered>
        <video
          src={preview.src}
          controls
          className="max-h-full max-w-full rounded-xl bg-fill"
        />
      </Centered>
    )
  }

  if (kind === 'audio' && preview.src) {
    return (
      <Centered>
        <audio src={preview.src} controls className="w-full max-w-lg" />
      </Centered>
    )
  }

  if (kind === 'pdf' && preview.src) {
    /* The browser's own PDF viewer, off a blob URL. This app ships no PDF renderer —
       pdf.js is not installed — so paging, search and zoom are whatever the browser
       provides. A browser without a built-in viewer shows its fallback here, and the
       download in the header remains the reliable route. */
    return (
      <iframe
        src={preview.src}
        title={name}
        className="h-full w-full border-0 bg-fill"
      />
    )
  }

  if (kind === 'markdown' && preview.text !== undefined) {
    return (
      <Document>
        <MarkdownBody text={preview.text} />
      </Document>
    )
  }

  if (kind === 'text' && preview.text !== undefined) {
    return (
      <Document wide>
        <pre className="scrollbar-minimal overflow-x-auto rounded-xl bg-fill-elevated p-4 font-mono text-label-sm text-primary">
          {preview.text}
        </pre>
      </Document>
    )
  }

  return (
    <Unavailable
      title="Nothing came back for this file"
      detail="Hermes answered, but with no readable content. Download it to get the file exactly as it is on disk."
      icon={<Icon className="size-8 text-tertiary" />}
    />
  )
}

/** A picture, a player or a message: middle of the window, no scroll of its own. */
const Centered: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex h-full items-center justify-center p-6">{children}</div>
)

/** A document: starts at its first line, scrolls, and stops at a readable measure. */
const Document: FC<PropsWithChildren<{ wide?: boolean }>> = ({ wide, children }) => (
  <div
    className={cn('scrollbar-minimal h-full overflow-auto p-6 [&>*]:mx-auto', {
      '[&>*]:max-w-4xl': wide === true,
      '[&>*]:max-w-3xl': wide !== true,
    })}
  >
    {children}
  </div>
)

const Unavailable: FC<{ title: string; detail: string; icon: ReactNode }> = ({
  title,
  detail,
  icon,
}) => (
  <Centered>
    <div className="flex max-w-md flex-col items-center gap-3 text-center">
      {icon}
      <p className="text-label-lg text-primary">{title}</p>
      <p className="text-label-md text-secondary">{detail}</p>
    </div>
  </Centered>
)
