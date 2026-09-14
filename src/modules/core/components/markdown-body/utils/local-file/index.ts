/**
 * Telling a path on this gateway's disk from a URL, and naming it.
 *
 * Both halves of the render need this: the transform decides what a match becomes from the
 * file's name, and the components decide whether a `src`/`href` should be pointed at
 * `/api/files/download` or left as the remote address it already is.
 */

/** True for an absolute Unix, home-relative, or Windows path — never for a URL. */
export function isLocalFilePath(value: string): boolean {
  if (!value) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[a-z]:[/\\]/i.test(value)) return false
  return value.startsWith('/') || value.startsWith('~/') || /^[a-z]:[/\\]/i.test(value)
}

/** The last segment of a path, on either separator. */
export function localFileName(path: string): string {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] ?? path
}
