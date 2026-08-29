import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { AcrobatIcon } from '@repo/icons/acrobat-reader-icon'
import { CodeIcon } from '@repo/icons/code-icon'
import { DefaultFileIcon } from '@repo/icons/default-file-icon'
import { ExcelIcon } from '@repo/icons/microsoft-excel-icon'
import { FileTextIcon } from '@repo/icons/file-text'
import { ImageIcon } from '@repo/icons/image-icon'
import { MusicIcon } from '@repo/icons/music'
import { PowerpointIcon } from '@repo/icons/microsoft-powerpoint-icon'
import { VideoIcon } from '@repo/icons/video-icon'
import { WordIcon } from '@repo/icons/microsoft-word-icon'

/**
 * How the viewer will treat a file, decided from its extension.
 *
 * Extension rather than the payload's `mime_type`, and that is a correction rather than a
 * shortcut: the listing runs `mimetypes.guess_type` on the server's own table, which on this
 * machine answers `application/octet-stream` for every `.md` in the workspace. A viewer
 * keyed on that would refuse to render the one file type the workspace is mostly made of.
 */
export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'markdown'
  | 'text'
  | 'spreadsheet'
  | 'slides'
  | 'document'
  | 'binary'

export interface FileKindDescription {
  kind: FileKind
  /** Lowercase, without the dot. `''` for a name with no extension. */
  extension: string
  icon: FC<PropsWithClassName>
  /**
   * False for everything this app has no renderer for. The viewer then states the reason
   * and offers the download, which always works.
   */
  canPreview: boolean
  /**
   * Why a preview is impossible, in the user's terms. Present only when `canPreview` is
   * false — a sentence naming what is missing, never an apology or a "coming soon".
   */
  cannotPreviewReason?: string
}

const EXTENSIONS: ReadonlyArray<readonly [FileKind, readonly string[]]> = [
  ['image', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico']],
  ['video', ['mp4', 'webm', 'mov', 'm4v', 'ogv']],
  ['audio', ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'flac', 'aac']],
  ['pdf', ['pdf']],
  ['markdown', ['md', 'markdown', 'mdx']],
  [
    'text',
    [
      'txt', 'text', 'log', 'csv', 'tsv', 'json', 'jsonl', 'ndjson', 'yaml', 'yml',
      'toml', 'ini', 'cfg', 'conf', 'env', 'xml', 'html', 'htm', 'css', 'scss',
      'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'kt',
      'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'swift', 'sh', 'bash', 'zsh', 'fish',
      'sql', 'graphql', 'gql', 'diff', 'patch', 'lock',
    ],
  ],
  ['spreadsheet', ['xlsx', 'xls', 'xlsm', 'ods', 'numbers']],
  ['slides', ['pptx', 'ppt', 'odp', 'key']],
  ['document', ['docx', 'doc', 'odt', 'rtf', 'pages']],
]

const ICONS: Readonly<Record<FileKind, FC<PropsWithClassName>>> = {
  image: ImageIcon,
  video: VideoIcon,
  audio: MusicIcon,
  pdf: AcrobatIcon,
  markdown: FileTextIcon,
  text: CodeIcon,
  spreadsheet: ExcelIcon,
  slides: PowerpointIcon,
  document: WordIcon,
  binary: DefaultFileIcon,
}

/**
 * Why each un-previewable kind cannot be previewed, named specifically.
 *
 * These are dependency facts, not backend gaps: `/api/files/download` hands over the real
 * bytes for all of them. What is missing is a renderer in *this* app — the installed set is
 * react-markdown, remark-gfm, three, zustand, react-query, radix and the router, and none of
 * them opens an Office file. Adding SheetJS or a pptx renderer is a decision about the
 * monorepo's dependency surface, not one to slip in behind a viewer, so the honest reading
 * is that the file downloads and opens in the app that owns it.
 */
const NO_RENDERER: Partial<Record<FileKind, string>> = {
  spreadsheet:
    'Spreadsheets need a workbook parser, and this app ships none. Download it to open in Excel, Numbers or Sheets.',
  slides:
    'Slide decks need a presentation renderer, and this app ships none. Download it to open in PowerPoint, Keynote or Slides.',
  document:
    'Word documents need a document renderer, and this app ships none. Download it to open in Word or Pages.',
  binary:
    'This app has no renderer for this file type. Download it to get the whole file, unchanged.',
}

/** The extension, lowercased and without its dot. `''` when the name carries none. */
export function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot <= 0 || dot === name.length - 1) return ''
  return name.slice(dot + 1).toLowerCase()
}

export function describeFileKind(name: string): FileKindDescription {
  const extension = fileExtension(name)
  const match = EXTENSIONS.find(([, list]) => list.includes(extension))
  const kind = match?.[0] ?? 'binary'
  const cannotPreviewReason = NO_RENDERER[kind]

  return {
    kind,
    extension,
    icon: ICONS[kind],
    canPreview: cannotPreviewReason === undefined,
    ...(cannotPreviewReason ? { cannotPreviewReason } : {}),
  }
}

/** "812 B", "13.3 KB", "1.4 MB". `null` size — a directory — has no answer. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return ''
  if (bytes < 1_000) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1_000
  let unit = 0
  while (value >= 1_000 && unit < units.length - 1) {
    value /= 1_000
    unit += 1
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit] ?? 'TB'}`
}
