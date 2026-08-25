import type { FC } from 'react'
import { DownloadIcon } from '@repo/icons/download'
import { FileTextIcon } from '@repo/icons/file-text'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'

interface AttachmentCardProps {
  name: string
  /** Already formatted for reading, e.g. "12 pages · 1.2 MB". */
  meta: string
  href: string
  className?: string
}

/**
 * A file the employee produced, sitting in the transcript next to the message
 * that made it.
 *
 * `href` is required rather than optional: a download button with nowhere to go
 * is a lie, so the card only exists once there is a real file behind it. Nothing
 * in this build can supply one yet — Hermes's `file.attach` returns an opaque
 * `@file:<ref>` with no name, size or URL, and `ChatMessage` carries no
 * attachment field — so wiring this up is a store change, not a UI one.
 */
export const AttachmentCard: FC<AttachmentCardProps> = ({ name, meta, href, className }) => (
  <div
    className={cn(
      'flex w-[360px] max-w-full items-center gap-3 rounded-2xl bg-fill-elevated p-3',
      className,
    )}
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fill-elevated-hover">
      <FileTextIcon className="size-5 text-secondary" />
    </span>

    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-label-md text-primary">{name}</span>
      <span className="truncate text-label-sm text-tertiary">{meta}</span>
    </span>

    <Button
      asChild
      variant="icon-outline"
      size="icon-sm"
      shape="pill"
      className="shrink-0 text-secondary [&>svg]:size-4"
    >
      <a href={href} download aria-label={`Download ${name}`}>
        <DownloadIcon />
      </a>
    </Button>
  </div>
)
