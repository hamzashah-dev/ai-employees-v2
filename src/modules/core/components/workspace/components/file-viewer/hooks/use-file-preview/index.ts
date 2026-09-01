import { useEffect, useState } from 'react'
import {
  fetchManagedFileBlob,
  managedFileUrl,
} from '@/modules/core/services/hermes/rest'
import {
  MANAGED_FILE_MAX_BYTES,
  PREVIEW_MAX_BYTES,
  TEXT_PREVIEW_MAX_BYTES,
} from '../../../../constants'
import { formatFileSize, type FileKind } from '../../../../utils/file-kind'

export interface UseFilePreviewResult {
  isLoading: boolean
  /**
   * What to point an `<img>`, `<video>`, `<audio>` or `<iframe>` at.
   *
   * A direct `/api/files/download` URL for media, a blob URL for a PDF. Never a data URL:
   * `/api/files/read` base64s the whole file, which inflates it by a third and produces a
   * string long enough to be refused as a URL.
   */
  src?: string
  /** The file's characters, for the markdown and plain-text panes. */
  text?: string
  /** A sentence naming why nothing can be shown. Rendered as the honest state. */
  problem?: string
}

/**
 * Loads whatever the open file needs, and nothing it does not.
 *
 * Three routes, chosen by kind and verified against a real browser rather than assumed:
 *
 * - **image / video / audio** — the `/api/files/download` URL, used directly. Its
 *   `Content-Disposition: attachment` does not apply to media subresources, so an `<img>`
 *   or `<video>` renders it; and `FileResponse` answers `Range` with a 206, so a video
 *   seeks without the file being pulled into memory first. Nothing is fetched here at all.
 * - **pdf** — a blob URL, and it has to be. An `<iframe>` pointed at the endpoint directly
 *   never fires `onload`: an iframe is a navigation, so Chrome honours the attachment
 *   disposition and turns it into a download. Both were tested; the blob URL renders and
 *   the direct URL times out. The blob carries the response's own `application/pdf`, which
 *   is what makes the viewer plugin pick it up.
 * - **markdown / text** — the same bytes, decoded to a string.
 *
 * The object URL is revoked on unmount and on every change of file. Skipping that pins the
 * whole file in the tab's memory for the life of the document, once per open.
 */
export function useFilePreview(
  path: string,
  kind: FileKind,
  size: number | null,
  canPreview: boolean,
): UseFilePreviewResult {
  const [state, setState] = useState<UseFilePreviewResult>({ isLoading: false })

  useEffect(() => {
    if (!canPreview) {
      setState({ isLoading: false })
      return
    }

    if (size != null && size > MANAGED_FILE_MAX_BYTES) {
      setState({
        isLoading: false,
        problem: `Hermes refuses to serve a file over ${formatFileSize(MANAGED_FILE_MAX_BYTES)}, so this one cannot be previewed or downloaded from here. It is on disk at the path above.`,
      })
      return
    }

    if (kind === 'image' || kind === 'video' || kind === 'audio') {
      setState({ isLoading: false, src: managedFileUrl(path) })
      return
    }

    const isTextual = kind === 'markdown' || kind === 'text'
    const ceiling = isTextual ? TEXT_PREVIEW_MAX_BYTES : PREVIEW_MAX_BYTES
    if (size != null && size > ceiling) {
      setState({
        isLoading: false,
        problem: `This file is ${formatFileSize(size)}. Anything over ${formatFileSize(ceiling)} has to be read into the browser whole to be shown, so it is offered as a download instead.`,
      })
      return
    }

    let objectUrl: string | undefined
    let cancelled = false
    setState({ isLoading: true })

    fetchManagedFileBlob(path)
      .then(async (blob) => {
        if (cancelled) return
        if (isTextual) {
          const text = await blob.text()
          if (!cancelled) setState({ isLoading: false, text })
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setState({ isLoading: false, src: objectUrl })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          isLoading: false,
          problem: error instanceof Error ? error.message : 'Could not read this file.',
        })
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path, kind, size, canPreview])

  return state
}
