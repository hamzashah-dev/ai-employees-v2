/// <reference types="vite/client" />

/**
 * The `VITE_*` surface this app reads.
 *
 * Only `VITE_HERMES_TARGET` is consumed by client code — the URL and the
 * expected COMPUTER_HOME are dev-server concerns and never reach the bundle.
 * `vite.config.ts` always `define`s the target, so it is present even when
 * `.env` leaves it out and the config derives it from the URL instead.
 */
interface ImportMetaEnv {
  readonly VITE_HERMES_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
