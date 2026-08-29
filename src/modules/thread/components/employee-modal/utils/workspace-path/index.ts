export interface Crumb {
  /** What the segment is called. The root crumb is labelled, not named after its directory. */
  label: string
  path: string
}

/** Trailing slashes off, so `/a/b` and `/a/b/` are the same directory. */
function normalise(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

/**
 * True when `path` is the workspace root or something inside it.
 *
 * The boundary is enforced here rather than trusted from the payload, because
 * `/api/files` has no root of its own on a stock install — `root` and `locked_root` come
 * back `null` unless the operator pinned `COMPUTER_DASHBOARD_FILES_ROOT`, so the backend
 * will happily list `/Users` if asked. The employee card claims to show one employee's
 * workspace; a directory click that walked out of it would make that claim false.
 *
 * Segment-aware, so `/w/workspace-old` is not inside `/w/workspace`.
 */
export function isWithinWorkspace(root: string, path: string): boolean {
  const base = normalise(root)
  const target = normalise(path)
  return target === base || target.startsWith(`${base}/`)
}

/**
 * The trail from the workspace root down to `path`, root first.
 *
 * The root crumb is labelled "Workspace" rather than named after the directory on disk: the
 * directory is always literally `workspace`, and the crumb is a destination rather than a
 * path fragment. Anything outside the root collapses to the root alone — the same refusal
 * `isWithinWorkspace` encodes, expressed as a trail that cannot lead out.
 */
export function buildBreadcrumbs(root: string, path: string): Crumb[] {
  const base = normalise(root)
  const crumbs: Crumb[] = [{ label: 'Workspace', path: base }]
  if (!isWithinWorkspace(base, path)) return crumbs

  const rest = normalise(path).slice(base.length).split('/').filter(Boolean)
  let walked = base
  for (const segment of rest) {
    walked = `${walked}/${segment}`
    crumbs.push({ label: segment, path: walked })
  }
  return crumbs
}

/**
 * One level up, never above the root.
 *
 * `null` at the root itself, which is what the Files page reads as "there is no Back".
 */
export function parentWithinWorkspace(root: string, path: string): string | null {
  const crumbs = buildBreadcrumbs(root, path)
  return crumbs[crumbs.length - 2]?.path ?? null
}
