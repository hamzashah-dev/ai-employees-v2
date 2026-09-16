/*
 * `defineConfig` comes from vitest, not vite: it is the same function widened
 * to know about the `test` key below. The alternative is casting the whole
 * config to silence one unknown property, which throws away type checking on
 * everything else in it.
 */
import { defineConfig } from 'vitest/config'
import { loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import {
  classifyHermesUrl,
  describeHermesTarget,
  isHermesTarget,
  type HermesTarget,
} from './src/modules/core/services/hermes/target'
import { agentPacks } from './build/agent-packs'

/**
 * `computer dashboard` injects a per-boot session token into the `index.html`
 * it serves. Vite serves its own `index.html`, so without forwarding that token
 * every protected `/api/*` call 401s.
 *
 * Scrape it from the running dashboard on each dev page load and re-inject.
 * No-op in production builds, where the app is served by the dashboard itself
 * and gets the real injection.
 */
function hermesDevToken(backend: string): Plugin {
  const TOKEN_RE = /window\.__COMPUTER_SESSION_TOKEN__\s*=\s*"([^"]+)"/
  const AUTH_REQUIRED_RE = /window\.__COMPUTER_AUTH_REQUIRED__\s*=\s*(true|false)/

  return {
    name: 'hermes:dev-session-token',
    apply: 'serve',
    async transformIndexHtml() {
      try {
        // A bare `fetch(backend)` breaks once the backend carries a path prefix
        // (e.g. the VM's reverse-proxied `.../dashboard`): the prefix without a
        // trailing slash serves an empty body there, and only `.../dashboard/`
        // returns the real HTML with the injected token. Normalize so both a
        // bare `host:port` and a path-prefixed backend fetch the same shape.
        const res = await fetch(`${backend.replace(/\/+$/, '')}/`, {
          headers: { accept: 'text/html' },
        })
        const html = await res.text()
        const token = html.match(TOKEN_RE)?.[1]
        const authRequired = html.match(AUTH_REQUIRED_RE)?.[1] ?? 'false'

        if (!token) {
          // Gated (non-loopback) mode deliberately withholds the token and
          // switches to cookies + ws-tickets. Say which case this is.
          console.warn(
            authRequired === 'true'
              ? `[hermes] ${backend} is in gated auth mode — no token is injected. ` +
                  `This app currently supports loopback mode only.`
              : `[hermes] No session token found at ${backend}. ` +
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
          `[hermes] Dashboard at ${backend} unreachable. Start it with ` +
            `\`computer dashboard\` or set VITE_HERMES_URL. (${(err as Error).message})`,
        )
      }
    },
  }
}

/**
 * Say which Hermes this dev server is pointed at, and fail fast when it is not
 * the install we expect.
 *
 * The banner is not decoration. Local and VM render an identical UI, so the
 * terminal is the only place the difference is visible before you have already
 * acted on the wrong roster.
 *
 * `/api/status` is one of the few unauthenticated routes, so the COMPUTER_HOME
 * check works before any token exists.
 */
function verifyBackend(
  backend: string,
  target: HermesTarget,
  expectedHome: string | undefined,
): Plugin {
  return {
    name: 'hermes:verify-backend',
    apply: 'serve',
    async configureServer() {
      console.info(
        `[hermes] target=${target} (${describeHermesTarget(target)}) → ${backend}`,
      )

      if (!expectedHome) return
      try {
        const res = await fetch(`${backend.replace(/\/+$/, '')}/api/status`)
        const status = (await res.json()) as { computer_home?: string }
        if (status.computer_home !== expectedHome) {
          throw new Error(
            `Backend at ${backend} reports COMPUTER_HOME=${status.computer_home}, ` +
              `expected ${expectedHome}. Refusing to start against the wrong install.`,
          )
        }
      } catch (err) {
        console.error(`[hermes] ${(err as Error).message}`)
        process.exit(1)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  /*
   * `loadEnv`, not `process.env`.
   *
   * Vite only exposes `.env` to *client* code via `import.meta.env`; the config
   * file itself runs before that and sees nothing but the real shell
   * environment. Reading `process.env.VITE_HERMES_URL` here — as this config
   * used to — meant a `VITE_HERMES_URL` written into `.env` was silently
   * ignored and the app fell back to loopback. That is precisely the quiet
   * wrong-backend failure the rest of this file exists to prevent.
   *
   * The empty prefix loads every key, so a shell `VITE_HERMES_URL=… npm run dev`
   * still wins over `.env` — `loadEnv` layers `process.env` on top.
   */
  const env = loadEnv(mode, import.meta.dirname, '')

  /**
   * The dashboard this app talks to.
   *
   * Deliberately has no hardcoded default beyond loopback. The documented
   * Hermes default port (9119) is not safe to assume: on a machine with more
   * than one checkout it is routinely held by a *different* agent install, and
   * talking to the wrong one fails silently — you get a roster of somebody
   * else's profiles rather than an error.
   */
  const backend = env.VITE_HERMES_URL ?? 'http://127.0.0.1:9121'

  /**
   * The COMPUTER_HOME the backend must report. When set, a mismatch aborts the
   * dev server instead of letting the app come up pointed at the wrong install.
   */
  const expectedHome = env.VITE_HERMES_COMPUTER_HOME || undefined

  /*
   * The declared label is cross-checked against the URL rather than trusted.
   * A label that can drift from the thing it names is worse than no label: it
   * reads as confirmation while being wrong. Derived from the URL when `.env`
   * leaves it out, so the banner and `import.meta.env` are never blank.
   */
  const declared = env.VITE_HERMES_TARGET
  const derived = classifyHermesUrl(backend)

  if (declared && !isHermesTarget(declared)) {
    throw new Error(
      `[hermes] VITE_HERMES_TARGET=${declared} is not a known target. ` +
        `Use 'local' (loopback dashboard) or 'vm' (cloud VM).`,
    )
  }

  if (isHermesTarget(declared) && declared !== derived) {
    throw new Error(
      `[hermes] VITE_HERMES_TARGET=${declared} but VITE_HERMES_URL=${backend} ` +
        `is the '${derived}' backend. Fix whichever of the two is stale — ` +
        `refusing to start with a label that misnames the backend.`,
    )
  }

  const target: HermesTarget = isHermesTarget(declared) ? declared : derived

  /**
   * Where the installable agent packs live.
   *
   * Two directories up is the cloud-computer checkout this app is a workspace
   * of. Overridable because the port into imagine-computer-web moves this app
   * out from under that checkout, and the packs will have to be pointed at
   * rather than assumed.
   */
  const agentsDir = env.VITE_AGENTS_DIR
    ? path.resolve(env.VITE_AGENTS_DIR)
    : path.resolve(import.meta.dirname, '../../agents')

  return {
    plugins: [
      react(),
      tailwindcss(),
      agentPacks({ agentsDir }),
      hermesDevToken(backend),
      verifyBackend(backend, target, expectedHome),
    ],
    /*
     * Defined rather than left to Vite's own `.env` exposure so the client sees
     * the *resolved* target — including the derived one, which never appears in
     * any `.env` file for Vite to pick up.
     */
    define: {
      'import.meta.env.VITE_HERMES_TARGET': JSON.stringify(target),
    },
    resolve: {
      /**
       * One React, whatever the install looks like.
       *
       * This app is a workspace of `cloud-computer-hermes`, which has its own `react` at the
       * repo root — and a *different* patch of it (19.2.7 there against the 19.2.0 pinned
       * here). Anything that resolves from the root `node_modules` rather than this one
       * therefore gets a second copy of React, and the first Radix popper to call `useState`
       * dies on a null dispatcher: "Invalid hook call … more than one copy of React".
       *
       * That happened for real, via `@radix-ui/react-popper` → `@floating-ui/react-dom`, and
       * it presents confusingly — the tooltip in a sidebar `NavRow` throws on a route change,
       * which looks like a routing bug rather than a resolution one.
       *
       * `dedupe` collapses every `react` / `react-dom` specifier onto a single copy, so the
       * hoisting layout stops mattering. Keep it even if the versions are aligned later:
       * the next dependency added at the root would silently reintroduce the split.
       */
      dedupe: ['react', 'react-dom'],
      /**
       * `@repo/*` mirrors the monorepo package specifiers so that ported code imports
       * exactly as it does in imagine-computer-web (`@repo/icons/search`). On the way back
       * into the monorepo the real workspace packages take over and no import line changes.
       */
      // Array form: entries are matched in order, so `@repo/ui/cn` must precede `@repo/ui`.
      alias: [
        { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
        {
          find: '@repo/icons',
          replacement: path.resolve(import.meta.dirname, './src/icons'),
        },
        {
          find: '@repo/types',
          replacement: path.resolve(import.meta.dirname, './src/repo-types'),
        },
        {
          find: '@repo/ui/cn',
          replacement: path.resolve(import.meta.dirname, './src/repo-ui/cn'),
        },
        {
          find: '@repo/ui',
          replacement: path.resolve(
            import.meta.dirname,
            './src/repo-ui/components/base',
          ),
        },
        {
          find: '@repo/utils',
          replacement: path.resolve(import.meta.dirname, './src/repo-utils'),
        },
      ],
    },
    server: {
      port: 5190,
      strictPort: true,
      // Protected /api/* routes cannot be called cross-origin: CORSMiddleware is
      // registered before the auth middleware in computer_cli/web_server.py, so
      // Starlette runs auth *outermost* and 401s the preflight before CORS ever
      // executes. Same-origin proxying is the only option, not a preference.
      // `ws: true` also carries /api/ws, the JSON-RPC chat socket.
      //
      // The target keeps any path prefix: the VM serves Hermes under
      // `/dashboard`, so `/api/x` here must reach `/dashboard/api/x` there.
      proxy: {
        '/api': { target: backend, changeOrigin: true, ws: true },
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
      /*
       * The marketplace suites render the whole catalog and take ~4s alone —
       * comfortably under Vitest's 5s default in isolation, but over it once the
       * full run has several jsdom environments competing for the same cores.
       * That produced four failures that passed the moment they were run on their
       * own, which reads as flakiness rather than the resource contention it is.
       */
      testTimeout: 20_000,
      hookTimeout: 20_000,
    },
  }
})
