import type { Root } from 'mdast'
import { describeFileKind } from '@/modules/core/components/workspace/utils/file-kind'
import { localFileName } from '../local-file'

/**
 * Turn the absolute paths a reply mentions into the files themselves.
 *
 * Hermes writes every generated deliverable into the agent's working directory and the
 * model reports where it landed — so an image generation reads "Image saved to:
 * `/Users/…/workspace/fal-ai-flux-2-klein-9b_….png`". That is the host's filesystem
 * layout printed at the user, and the picture they asked for is nowhere on screen.
 *
 * This is the same job `BasePlatform.extract_local_files` does for Telegram and Discord
 * (`gateway/platforms/base.py`), and the port is deliberate — one behaviour, two clients.
 * Two departures from it, both because a chat bubble is not a chat platform:
 *
 * - **Inline code counts.** The gateway skips paths inside backticks so it never mutilates
 *   a code sample. The model puts the path in backticks most of the time, so skipping them
 *   here would mean skipping the case this exists for. Only an inline-code span that is
 *   *nothing but* a path is replaced; one with prose or a command around it is left alone.
 * - **Only true deliverables.** The gateway's extension list runs all the way to `.md`,
 *   `.json` and `.zip`, because a chat platform can upload anything. Here the set is what
 *   the app can actually show a person — image, video, audio, pdf, decided by
 *   `describeFileKind` rather than a second extension table — so "I edited
 *   /path/output_dir.py" stays a sentence.
 *
 * The path is left on the node as-is; `MarkdownBody` is where it becomes an
 * `/api/files/download` URL, so this transform stays pure and token-free.
 */

/**
 * Ported from the gateway's `path_re`, extension match widened because the kind check
 * below does the filtering. The lookbehind is what keeps a remote URL out: in
 * `https://v3b.fal.media/files/b/0aa8955a.png` the candidate would start at `/files`,
 * whose preceding character is a word character.
 */
const LOCAL_PATH =
  /(?<![/:\w.])(?:~\/|\/|[A-Za-z]:[/\\])(?:[\w.-]+[/\\])*[\w.-]+\.[A-Za-z0-9]{1,6}\b/g

/** Kinds worth rendering, and the node each becomes. */
const RENDERABLE = {
  image: 'image',
  video: 'link',
  audio: 'link',
  pdf: 'link',
} as const

/**
 * Structural view of an mdast node.
 *
 * mdast's real types give every parent a different `children` union, so a generic walker
 * written against them spends more lines on casts than on work. One cast at the entry
 * point is the honest trade.
 */
interface MdastNode {
  type: string
  value?: string
  url?: string
  alt?: string
  children?: MdastNode[]
}

/** The node a media path becomes, or `null` when the path is not a deliverable. */
function mediaNode(path: string): MdastNode | null {
  const name = localFileName(path)
  const { kind } = describeFileKind(name)
  const shape = RENDERABLE[kind as keyof typeof RENDERABLE]
  if (!shape) return null
  if (shape === 'image') return { type: 'image', url: path, alt: name }
  return { type: 'link', url: path, children: [{ type: 'text', value: name }] }
}

/** Split a text value on its media paths, or `null` when it holds none. */
function splitText(value: string): MdastNode[] | null {
  const parts: MdastNode[] = []
  let cursor = 0
  let replaced = false

  for (const match of value.matchAll(LOCAL_PATH)) {
    const path = match[0]
    const start = match.index
    const media = mediaNode(path)
    if (!media) continue
    if (start > cursor) parts.push({ type: 'text', value: value.slice(cursor, start) })
    parts.push(media)
    cursor = start + path.length
    replaced = true
  }

  if (!replaced) return null
  if (cursor < value.length) parts.push({ type: 'text', value: value.slice(cursor) })
  return parts
}

/** The node an inline-code span becomes, when the span is a bare path and nothing else. */
function wholeCode(value: string): MdastNode | null {
  const path = value.trim()
  const match = LOCAL_PATH.exec(path)
  LOCAL_PATH.lastIndex = 0
  if (!match || match[0] !== path) return null
  return mediaNode(path)
}

function walk(parent: MdastNode): void {
  const children = parent.children
  if (!children) return

  const next: MdastNode[] = []
  let changed = false

  for (const child of children) {
    if (child.type === 'text' && child.value !== undefined) {
      const parts = splitText(child.value)
      if (parts) {
        next.push(...parts)
        changed = true
        continue
      }
    } else if (child.type === 'inlineCode' && child.value !== undefined) {
      const node = wholeCode(child.value)
      if (node) {
        next.push(node)
        changed = true
        continue
      }
    } else {
      walk(child)
    }
    next.push(child)
  }

  if (changed) parent.children = next
}

export function remarkLocalMedia() {
  return (tree: Root): void => {
    walk(tree as unknown as MdastNode)
  }
}
