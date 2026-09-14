/**
 * Which Hermes install this app is pointed at.
 *
 * Two backends are in routine use and they fail identically-looking: a local
 * `computer dashboard` on loopback, and the shared cloud VM behind Caddy.
 * Nothing in a running UI tells them apart — roster, profiles and chrome all
 * render the same — so a dev server aimed at the wrong one does not look like
 * an error, it looks like a working app holding somebody else's data.
 *
 * So the target is *declared* in `.env` and cross-checked against the URL at
 * startup. A stale `.env` becomes a boot failure instead of a confusing hour.
 */

export const HERMES_TARGETS = ['local', 'vm'] as const

export type HermesTarget = (typeof HERMES_TARGETS)[number]

/**
 * Every spelling a loopback Hermes can present as. Anything else is remote,
 * which in this project means the VM.
 */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'])

export function isHermesTarget(value: string | undefined): value is HermesTarget {
  return value !== undefined && (HERMES_TARGETS as readonly string[]).includes(value)
}

/**
 * Derive the target from the backend URL.
 *
 * This is the source of truth that the declared label is checked against: the
 * URL is what actually gets fetched, the label is only what someone wrote down.
 */
export function classifyHermesUrl(url: string): HermesTarget {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    /*
     * An unparseable URL is not loopback in any useful sense, and answering
     * 'local' here would let a typo pass the mismatch check below silently.
     */
    return 'vm'
  }

  return LOOPBACK_HOSTS.has(hostname) ? 'local' : 'vm'
}

export function describeHermesTarget(target: HermesTarget): string {
  return target === 'local' ? 'local dashboard' : 'cloud VM'
}
