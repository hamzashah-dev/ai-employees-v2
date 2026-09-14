import type { FC } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@repo/ui/cn'
import { LocalMediaImage } from './components/local-media-image'
import { MediaChip } from './components/media-chip'
import { isLocalFilePath } from './utils/local-file'
import { remarkLocalMedia } from './utils/remark-local-media'

/**
 * Markdown for employee replies.
 *
 * Modest on purpose: an agent's answer is prose with the occasional list or
 * snippet, not a document. Headings step down in size but never shout, and the
 * only weights available are 400 and 500 — so `strong` is overridden, since the
 * browser default of 700 is not in this type system.
 *
 * One transform beyond GFM: `remarkLocalMedia` turns the absolute paths a reply mentions
 * into `image` and `link` nodes, and the two overrides below are where a path on the
 * gateway's disk becomes something a browser can fetch. Remote URLs pass through
 * untouched — the model links plenty of pages, and only a local path needs translating.
 */

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 text-heading-sm font-medium first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-body-md font-medium first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1 text-label-md font-medium first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-1 text-label-md font-medium first:mt-0">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-4 mb-1 text-label-md font-medium first:mt-0">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-4 mb-1 text-label-md font-medium first:mt-0">{children}</h6>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  a: ({ href, children }) =>
    href && isLocalFilePath(href) ? (
      <MediaChip path={href} />
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-brand underline underline-offset-2"
      >
        {children}
      </a>
    ),
  img: ({ src, alt }) => {
    const url = typeof src === 'string' ? src : ''
    if (isLocalFilePath(url)) return <LocalMediaImage path={url} alt={alt} />
    return (
      <img
        src={url}
        alt={alt ?? ''}
        loading="lazy"
        className="my-2 max-h-[360px] max-w-full rounded-xl"
      />
    )
  },
  code: ({ className, children }) => (
    <code
      className={cn(
        'rounded-md bg-fill-elevated px-1.5 py-0.5 font-mono text-label-sm',
        className,
      )}
    >
      {children}
    </code>
  ),
  // The nested `code` keeps its own font and size but drops the inline chip's
  // background and padding, so a block reads as one surface.
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-fill-elevated p-3 last:mb-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-secondary pl-3 text-secondary last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-t border-primary" />,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-label-md">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-primary px-2 py-1 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-primary px-2 py-1 align-top">{children}</td>
  ),
}

interface MarkdownBodyProps {
  text: string
  className?: string
}

export const MarkdownBody: FC<MarkdownBodyProps> = ({ text, className }) => (
  <div className={cn('text-body-md text-primary', className)}>
    <Markdown remarkPlugins={[remarkGfm, remarkLocalMedia]} components={components}>
      {text}
    </Markdown>
  </div>
)
