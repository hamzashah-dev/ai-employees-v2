import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * The dashboard this app talks to.
 *
 * Deliberately has no hardcoded default. The documented Hermes default port
 * (9119) is not safe to assume: on a machine with more than one checkout it is
 * routinely held by a *different* agent install, and talking to the wrong one
 * fails silently — you get a roster of somebody else's profiles rather than an
 * error. `verifyBackend` below turns that into a loud startup failure.
 */
const BACKEND = process.env.VITE_HERMES_URL ?? 'http://127.0.0.1:9121'

/**
 * The COMPUTER_HOME the backend must report. When set, a mismatch aborts the
 * dev server instead of letting the app come up pointed at the wrong install.
 */
const EXPECTED_HOME = process.env.VITE_HERMES_COMPUTER_HOME

/**
 * `computer dashboard` injects a per-boot session token into the `index.html`
 * it serves. Vite serves its own `index.html`, so without forwarding that token
 * every protected `/api/*` call 401s.
 *
 * Scrape it from the running dashboard on each dev page load and re-inject.
 * No-op in production builds, where the app is served by the dashboard itself
 * and gets the real injection.
 */
function hermesDevToken(): Plugin {
  const TOKEN_RE = /window\.__COMPUTER_SESSION_TOKEN__\s*=\s*"([^"]+)"/
  const AUTH_REQUIRED_RE = /window\.__COMPUTER_AUTH_REQUIRED__\s*=\s*(true|false)/

  return {
    name: 'hermes:dev-session-token',
    apply: 'serve',
    async transformIndexHtml() {
      try {
        const res = await fetch(BACKEND, { headers: { accept: 'text/html' } })
        const html = await res.text()
        const token = html.match(TOKEN_RE)?.[1]
        const authRequired = html.match(AUTH_REQUIRED_RE)?.[1] ?? 'false'

        if (!token) {
          // Gated (non-loopback) mode deliberately withholds the token and
          // switches to cookies + ws-tickets. Say which case this is.
          console.warn(
            authRequired === 'true'
              ? `[hermes] ${BACKEND} is in gated auth mode — no token is injected. ` +
                  `This app currently supports loopback mode only.`
              : `[hermes] No session token found at ${BACKEND}. ` +
                  `Is \`computer dashboard\` running? Protected /api calls will 401.`,
          )
          return
        }

        return [
          {
            tag: 'script',
            injectTo: 'head' as const,
            children:
              `window.__COMPUTER_SESSION_TOKEN__=${JSON.stringify(token)};` +
              `window.__COMPUTER_AUTH_REQUIRED__=${authRequired};`,
          },
        ]
      } catch (err) {
        console.warn(
          `[hermes] Dashboard at ${BACKEND} unreachable. Start it with ` +
            `\`computer dashboard\` or set VITE_HERMES_URL. (${(err as Error).message})`,
        )
      }
    },
  }
}

/**
 * Fail fast when the configured backend is not the install we expect.
 *
 * `/api/status` is one of the few unauthenticated routes, so this works before
 * any token exists.
 */
function verifyBackend(): Plugin {
  return {
    name: 'hermes:verify-backend',
    apply: 'serve',
    async configureServer() {
      if (!EXPECTED_HOME) return
      try {
        const res = await fetch(`${BACKEND}/api/status`)
        const status = (await res.json()) as { computer_home?: string }
        if (status.computer_home !== EXPECTED_HOME) {
          throw new Error(
            `Backend at ${BACKEND} reports COMPUTER_HOME=${status.computer_home}, ` +
              `expected ${EXPECTED_HOME}. Refusing to start against the wrong install.`,
          )
        }
      } catch (err) {
        console.error(`[hermes] ${(err as Error).message}`)
        process.exit(1)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), hermesDevToken(), verifyBackend()],
  resolve: {
    /**
     * `@repo/*` mirrors the monorepo package specifiers so that ported code imports
     * exactly as it does in imagine-computer-web (`@repo/icons/search`). On the way back
     * into the monorepo the real workspace packages take over and no import line changes.
     */
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@repo/icons': path.resolve(import.meta.dirname, './src/icons'),
      '@repo/types': path.resolve(import.meta.dirname, './src/repo-types'),
    },
  },
  server: {
    port: 5190,
    strictPort: true,
    // Protected /api/* routes cannot be called cross-origin: CORSMiddleware is
    // registered before the auth middleware in computer_cli/web_server.py, so
    // Starlette runs auth *outermost* and 401s the preflight before CORS ever
    // executes. Same-origin proxying is the only option, not a preference.
    // `ws: true` also carries /api/ws, the JSON-RPC chat socket.
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true, ws: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
} as Parameters<typeof defineConfig>[0])
