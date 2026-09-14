import { useState, type FC } from 'react'
import { managedFileUrl } from '@/modules/core/services/hermes/rest'
import { localFileName } from '../../utils/local-file'
import { MediaChip } from '../media-chip'

/**
 * A file on the gateway's disk, rendered in the reply that produced it.
 *
 * `/api/files/download` is the route, and it is the right one despite the name: its
 * `Content-Disposition: attachment` does not apply to an image subresource, and it is the
 * only managed-files route that accepts the session token as a query param — which a
 * browser needs here, since an `<img>` cannot carry a header. Same reasoning, and the same
 * `managedFileUrl` helper, as the workspace file viewer.
 *
 * The failure path is not decoration. This app cannot know whether the file still exists,
 * and a 404 or a 403 (a path outside the managed root) both arrive as an `error` event
 * with nothing on screen, so the chip is what the user gets instead of a broken frame.
 */

interface LocalMediaImageProps {
  /** Absolute path on the gateway host. */
  path: string
  alt?: string
}

export const LocalMediaImage: FC<LocalMediaImageProps> = ({ path, alt }) => {
  const [failed, setFailed] = useState(false)
  if (failed) return <MediaChip path={path} />

  return (
    <img
      src={managedFileUrl(path)}
      alt={alt || localFileName(path)}
      loading="lazy"
      onError={() => setFailed(true)}
      className="my-2 max-h-[360px] max-w-full rounded-xl border border-primary object-contain"
    />
  )
}
