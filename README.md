# AI Employees

A React front end that treats Hermes agent profiles as a roster of coworkers:
one thread per employee, several of them working at once.

Built from `AI Employees Canvas.dc.html` (screens D1, D6, D11, D15), following
the conventions of `chatly-web` at a much smaller scale.

---

## Running it

You need a Hermes dashboard running, and **Node 22** (see Caveats).

```bash
# 1. Start the dashboard, if it is not already up
computer dashboard --port 9121

# 2. Point this app at it and run
cd apps/employees
export PATH="/opt/homebrew/Cellar/node@22/22.23.2_1/bin:$PATH"
VITE_HERMES_URL=http://127.0.0.1:9121 npm run dev
```

Open http://localhost:5190.

To refuse to start against the wrong Hermes install (see Caveats), also set:

```bash
export VITE_HERMES_COMPUTER_HOME=/Users/vyro/cloud-computer-hermes/.computer
```

### Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Vite dev server on 5190               |
| `npm run build`     | Typecheck, then production build       |
| `npm run typecheck` | `tsc --noEmit`                        |
| `npm test`          | Vitest                                |
| `npm run lint`      | ESLint, zero warnings tolerated        |
| `npm run quality`   | typecheck + lint + test               |

---

## How it talks to Hermes

Two surfaces, and the split is not arbitrary.

**Chat is a WebSocket.** There is no REST endpoint anywhere in the dashboard
that runs an agent turn. Chat is JSON-RPC 2.0 over `/api/ws`
(`tui_gateway.ws.handle_ws`): `session.create` / `prompt.submit` /
`session.interrupt` up, and `message.delta`, `tool.start`, `approval.request`
and friends pushed down as unsolicited `event` frames.

**Everything else is REST** — `/api/profiles`, `/api/sessions`, `/api/cron/jobs`.

One socket serves the whole app. Employees are separate *sessions* on it, not
separate connections: `session.create` accepts a `profile`, and Hermes rebinds
`COMPUTER_HOME` per turn and persists to that profile's own `state.db`. Turns
run on per-session threads with no global lock, so several employees genuinely
work at once over a single connection.

```
  App
   └── HermesGateway ── one WebSocket /api/ws ── JSON-RPC framing, reconnect
        └── SessionManager ── profile → sessionId
             └── chat-store ── events → threads, keyed by profile
```

### Layout

```
src/
  app/                    router, providers, shell, connection banner
  modules/
    core/
      components/         avatar, button, status pill, icons
      hooks/use-hermes/   boots the single connection
      services/hermes/    config, rest, gateway, session-manager, types
      stores/chat-store   live thread state + the pure event reducer
      utils/              cn, identity, time
    roster/               the 256px sidebar
    thread/               the chat column and composer
    panel/                the right drawer and Routines
    marketplace/          the agent catalog
  styles/globals.css      every design token
```

---

## Caveats — all of these are real, and all cost time to rediscover

**Node 25 is broken on this machine.** `/opt/homebrew/bin/node` (25.9.0) fails
with a missing `libsimdutf.34.dylib`, because Homebrew's active `simdutf` is
9.1.0 and only 9.0.0 ships that soname. Use Node 22, which also matches
chatly-web's engine range:

```bash
export PATH="/opt/homebrew/Cellar/node@22/22.23.2_1/bin:$PATH"
```

**Install with `--no-workspaces`.** The repo root declares
`workspaces: ["apps/*", …]`, so a plain `npm install` here rewrites the root
`package-lock.json` and drops the repo's own workspace links (`@computer/shared`,
`@computer/ink`). This app keeps its own lockfile:

```bash
npm install --no-workspaces
```

**Cross-origin `/api` calls cannot work, so dev must proxy.** In
`computer_cli/web_server.py` the CORS middleware is registered *before* the auth
middleware, and Starlette runs last-registered first — so auth sits outermost
and returns 401 to the CORS preflight before any `access-control-*` header is
attached. A browser therefore never gets to send the real request. `vite.config.ts`
proxies `/api` (with `ws: true`) to make everything same-origin. WebSockets are
exempt: upgrades have no preflight and the origin guard accepts any loopback host.

**Port 9119 is not a safe default.** It is the documented Hermes port, but on
this machine it is held by a *different* checkout (`/Users/vyro/charon-hermes`,
v0.14.0). Talking to the wrong one fails silently — you get someone else's
roster. `VITE_HERMES_URL` has no fallback for that reason, and setting
`VITE_HERMES_COMPUTER_HOME` turns a mismatch into a startup failure.

**An unknown profile name does not error.** `_profile_home` wraps every failure
path in `except Exception: return None`, and `None` means "use the launch
profile" — so a typo routes a marketing brief to the generic agent. Worse, the
`info.profile_name` the server echoes back always reports the *process-global*
profile (it comes from `_current_profile_name()`, which reads `COMPUTER_HOME`),
so the client cannot detect the fallback afterwards. `SessionManager` therefore
validates every name against `GET /api/profiles` before creating a session, and
`info.profile_name` is never used to identify an employee.

**Profiles in this checkout may have no model.** `ad-creator` and
`startup-kit-agent` report `model: null` — their `config.yaml` and `SOUL.md`
were removed by commit `b8d2b0d4b`, and `.computer/*` is gitignored, so they
cannot run a turn. Restore them with:

```bash
git checkout b8d2b0d4b^ -- .computer/profiles/
```

Only `default` works otherwise. The panel surfaces "No model configured" rather
than showing a blank.

---

## Deliberately not built

- **D3, the Employees home dashboard** — cut from scope. `/employees` resolves
  to the employee you last spoke to.
- **The live-screen tile in D11.** Hermes has no screen-capture backend of any
  kind. Routines beside it are real, backed by `/api/cron/jobs`. Showing a
  plausible-looking fake screen would have been worse than showing nothing.
- **Marketplace install beyond profile creation.** The catalog is a static
  constant — Hermes has no agent registry (`/api/skills/hub/*` is *skills*, a
  different thing, and the canvas is explicit that skills stay in AI Market).
  Install is real: it calls `POST /api/profiles`.
- **Approval responses.** `approval.request` is received and surfaced, but
  answering it only dismisses the card locally; the response RPC is not wired.
  The card says so rather than pretending.
- **Light theme and mobile.** The canvas is dark-only and desktop-only. Tokens
  are written in two tiers so a light pass means redeclaring tier 2, not a rewrite.
- **Gated (non-loopback) auth.** That mode is a different protocol — cookies plus
  a single-use 30s ws-ticket per socket. All URL and header construction is
  funnelled through `services/hermes/config.ts` so it is a one-file addition.

The canvas itself is labelled *"Round 1 — 6 of 24 artboards"*: empty, loading,
error and focus states are undesigned. Those here were designed to match the
canvas's system, and are the most likely thing to want a designer's eye.
