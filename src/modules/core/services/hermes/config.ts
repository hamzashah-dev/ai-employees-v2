/**
 * Where the backend is, and how we authenticate to it.
 *
 * Every fetch and every socket URL in the app is built here. That is the whole
 * point: Hermes has a second, quite different auth mode for non-loopback binds
 * (no injected token, cookie auth with credentials:'include', and a single-use
 * 30s ws-ticket per socket). Keeping construction in one file means supporting
 * it later is an edit here rather than a hunt through the codebase.
 */

import { isHermesTarget, type HermesTarget } from './target'

declare global {
  interface Window {
    __COMPUTER_SESSION_TOKEN__?: string
    __COMPUTER_AUTH_REQUIRED__?: boolean
  }
}

/**
 * Same-origin by default, and that is not a stylistic choice.
 *
 * Protected `/api/*` routes cannot be called cross-origin at all: in
 * `computer_cli/web_server.py` the CORS middleware is registered *before* the
 * auth middleware, and Starlette runs last-registered first — so auth sits
 * outermost and returns 401 to the preflight before CORS can attach headers.
 * A browser therefore never gets to send the real request. In dev, Vite proxies
 * `/api` so everything is same-origin; in production the dashboard serves this
 * app itself.
 */
export const API_BASE = ''

/**
 * Which Hermes this bundle was built to talk to, as declared in `.env`.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time, so this is a constant in
 * the output rather than something the running app can be talked out of. It is
 * a *label* only: `vite.config.ts` owns checking it against the URL actually
 * being proxied, because that check needs the URL, which the browser never sees.
 *
 * The `local` fallback is for the test environment, which has no Vite `define`.
 */
export const HERMES_TARGET: HermesTarget = isHermesTarget(import.meta.env.VITE_HERMES_TARGET)
  ? import.meta.env.VITE_HERMES_TARGET
  : 'local'

export function getSessionToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return window.__COMPUTER_SESSION_TOKEN__
}

export function isGatedAuthMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.__COMPUTER_AUTH_REQUIRED__ === true
}

export function authHeaders(): Record<string, string> {
  const token = getSessionToken()
  return token ? { 'X-Computer-Session-Token': token } : {}
}

/**
 * Browsers cannot set headers on a WebSocket upgrade, so the token goes in the
 * query string. This is the documented contract, not a workaround.
 */
export function gatewaySocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const token = getSessionToken()
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${protocol}//${window.location.host}/api/ws${query}`
}
