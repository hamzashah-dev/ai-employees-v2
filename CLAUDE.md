# CLAUDE.md

Guidance for anyone — human or agent — working in this repo.

## What this is

**AI Employees** is a standalone Vite + React 19 app that talks to a local **Hermes** agent
gateway. It is a staging ground: the code is written to be lifted wholesale into
**imagine-computer-web** (the Imagine Computer monorepo), so it deliberately mirrors that
repo's design tokens, component library, folder convention and idioms rather than inventing
its own.

Two consequences follow, and almost every rule below is downstream of them:

1. **Import specifiers must match the monorepo.** `@repo/ui/button`, `@repo/icons/search`,
   `@repo/types/common` all resolve here to local mirrors via Vite + tsconfig aliases. On the
   way back into the monorepo the real workspace packages take over and **no import line
   changes**.
2. **The mirrors are copies, not forks.** Keep them byte-faithful so they can be refreshed
   with `rsync` and deleted on port-back.

```
src/icons/        ← mirror of packages/icons/src            aliased @repo/icons/*
src/repo-ui/      ← mirror of packages/ui (cn + base/*)     aliased @repo/ui/*
src/repo-utils/   ← mirror of packages/utils/src            aliased @repo/utils/*
src/repo-types/   ← mirror of packages/types/src            aliased @repo/types/*
```

Each carries a README listing its deviations. **If you must change a mirrored file, record it
there** — otherwise the next refresh silently reverts you.

## Commands

```bash
npm run dev        # Vite on :5190 — needs a Hermes dashboard, see below
npm run quality    # typecheck + lint + test — run this before you call anything done
npm run typecheck  # tsc --noEmit
npm run lint       # eslint --max-warnings 0
npm test           # vitest run
```

### Running against Hermes

The app is same-origin only: Hermes registers CORS *before* auth, so a cross-origin `/api/*`
call 401s at the preflight. Vite proxies instead, and scrapes the dashboard's per-boot session
token out of its HTML at each page load.

`vite.config.ts` deliberately has **no default backend port**. The documented 9119 is routinely
held by a *different* checkout's install, and talking to the wrong one fails silently — you get
somebody else's roster rather than an error. Point it explicitly:

```bash
VITE_HERMES_URL=http://127.0.0.1:9119 npm run dev
```

Confirm which install you are on with `curl -s http://127.0.0.1:9119/api/status | jq .computer_home`.
Set `VITE_HERMES_COMPUTER_HOME` to turn a mismatch into a startup failure instead of a silent one.

---

# Design language

## Never write a raw colour

The token layer in `src/styles/tokens.css` is a port of the monorepo's `globals.css`, kept
structurally identical — same `@theme inline` indirection, same primitive ramps, same
`:root` / `.light` / `.dark` split. Every design value is a **named utility**:

| use | utility | dark value |
|---|---|---|
| app background | `bg-primary` | `#0F0F0F` neutral-110 |
| raised surface, card footers | `bg-fill` / `bg-surface` | `#171717` neutral-100 |
| cards, chips, user bubble, composer | `bg-fill-elevated` | `#212121` neutral-90 |
| hover on a nav row | `bg-fill-variant-hover` | `#212121` |
| **active** nav row | `bg-fill-variant-active` | `#2E2E2E` neutral-80 |
| primary button fill | `bg-fill-inverse` (label `text-inverse`) | white |
| hairline border | `border-primary` | `#212121` |
| outline controls | `border-secondary` | `#2E2E2E` |
| primary / secondary / tertiary text | `text-primary` / `text-secondary` / `text-tertiary` | `#FFF` / `#BDBDBD` / white 50% |
| success / warning / critical | `text-success` / `text-warning` / `text-critical` | `#24A148` / `#B28600` / `#FA4D56` |

**Banned:** raw hex, `bg-[rgb(var(--…))]`, and `text-[…]` arbitrary colour values. If a colour
seems to have no token, you are probably looking for a differently-named one — check
`tokens.css` before inventing anything.

## Type is a token too

Never pair a size utility with `leading-*` or `tracking-*`. The scale carries all three:

`text-label-xs` 11/16 · `text-label-sm` 12/16 · `text-label-md` 14/20 · `text-label-lg` 16/20 ·
`text-body-sm` 14/20 · `text-body-md` 16/24 · `text-heading-xs` 20/24 · `text-heading-sm` 24/32 ·
`text-heading-lg` 32/40

Tracking is a percentage of the size, which is why `text-label-md` *is* the design's `.42px`.
Weights are 400 and 500 only — there is no bold in this type system.

## `cn`, and the trap it exists to avoid

Always `import { cn } from '@repo/ui/cn'`. It is **not** bare `tailwind-merge`: it wraps
`extendTailwindMerge` with class groups for the custom scales. Plain `twMerge` classifies
`text-label-sm` as a *text colour* and silently drops it when merged with `text-secondary` —
the type scale vanishes and the line renders at body size.

House style for conditionals is object notation — static classes first, conditionals in a
trailing object. Never `cond && 'class'`, never a ternary inside `cn`:

```tsx
cn('flex h-10 items-center rounded-xl px-3', {
  'bg-fill-variant-active': isActive,
  'justify-center': isCollapsed,
})
```

## Icons

One prop — `className` — and nothing else. Colour comes from `currentColor`, size from
`size-*`. Never pass `size`, `color`, or a style object.

```tsx
import { SearchIcon } from '@repo/icons/search'
<SearchIcon className="size-4 stroke-[1.2px] text-secondary" />
```

Name traps, verified by comparing path data — do **not** substitute by name:
`store` is four circles, not a storefront · `clock` is a *history* glyph, the real clock is
`time-clock-icon` · `spark` is a lightning bolt · `x` is a plain cross, not the X logo ·
`tools` (wrench) and `tools-icon` (ruler+pencil) both export `ToolsIcon` · chat send is
`arrow-up`, not `send-icon` (a paper plane) · `file` is filled, `file-text` is outlined.

## Breakpoints

`tablet:` 768 · `laptop:` 1024 · `desktop-sm:` **1280** · `desktop:` 1440.

The sidebar's breakpoint is **`desktop-sm` (1280), not 1024** — the single most common thing to
get wrong. Above it the sidebar is a fixed panel (256px, or a 48px icon rail when collapsed);
below it, a drawer that overlays the content, and the main column is never offset. Transitions
are `duration-200 ease-linear`.

---

# Code conventions

These match imagine-computer-web except where noted.

- **No semicolons, single quotes.** (The monorepo runs Prettier with semicolons on; this app has
  no Prettier. Match the file you are in.)
- **Named exports only.** No `export default` anywhere. Lazy imports therefore go through
  `.then((m) => ({ default: m.Thing }))`.
- **Components are arrow functions with an explicit `FC`:**
  `export const Thing: FC<ThingProps> = ({ … }) => …`. No `function` components, no
  `forwardRef`, no `memo` unless something measured says otherwise.
- **`interface ThingProps` directly above the component**, in the same file. Promote to
  `types/index.ts` only when a second file imports it. Very small prop sets inline into the
  generic: `FC<{ item: NavItem }>`.
- **`import type` always**, enforced by `consistent-type-imports` + `verbatimModuleSyntax`.
- **Every unit is a kebab-case folder with an `index.ts(x)`** — components, hooks, utils,
  constants, contexts, stores, types alike.
- **Underscore-separated numeric literals**: `15_000`, not `15000`.
- **`noUncheckedIndexedAccess` is on**, which is why array indexing is followed by `?? fallback`.

## Folder structure

```
src/
  app/                     thin shell: routing, providers, shell chrome
  modules/
    core/                  cross-cutting; imports no feature module
      components/ hooks/ constants/ services/ stores/ types/ utils/
    <feature>/             roster, thread, panel, marketplace, dashboard
      index.tsx            the module's entry component
      components/ hooks/ constants/ contexts/ stores/ types/ utils/
      usecases/<page>/     only when the module is mounted on more than one page
  icons/ repo-ui/ repo-utils/ repo-types/    monorepo mirrors — see above
  styles/                  tokens.css (ported) + globals.css (app layer)
```

**The one hard rule:** a feature module may import from `modules/core` and `@repo/*` **only** —
never from another feature module's internals. If two features need the same thing, promote it
to `core`. (Example: `AccountAvatar` and `ACCOUNT_NAME` live in core because the sidebar footer,
the top bar and the dashboard greeting all need them.)

**Locality first.** Code starts as deep as it can and is promoted when a second consumer
appears — not before.

## Logic goes in a hook

`index.tsx` should be JSX and `cn()`. State, derivation, effects and handlers belong in a
co-located `hooks/use-<name>/index.ts`. This is near-universal upstream and worth keeping: it
makes the markup skimmable and the logic testable without rendering.

## Comments earn their place

The house style is prose JSDoc explaining **why**, not what. The valuable ones in this repo
record things that are invisible in the code and expensive to rediscover — why CORS forces
same-origin, why `profile_name` from Hermes is untrustworthy, why `min-w-0` on the sidebar is
load-bearing, why a `twMerge` pairing is avoided. Keep writing those. Do not narrate the obvious.

---

# Working with Hermes

`src/modules/core/services/hermes/` is the whole backend surface:
`config.ts` (session token, socket URL) · `rest.ts` (REST + `HermesHttpError`) ·
`gateway.ts` (one JSON-RPC WebSocket for the app, with backoff) ·
`session-manager.ts` (one session per profile) · `types.ts` (the wire vocabulary).

State lives in `stores/chat-store.ts`, keyed **by profile name**, with a pure exported
`reduceEvent` that has its own tests. Extend that reducer and its tests rather than reaching
into components.

### Be honest about what the backend cannot do

This is the most important product rule in the repo, and the existing code follows it
consistently. Hermes has no user-identity endpoint, no per-profile role or avatar, no approval
RPC, no progress fraction, no marketplace catalogue. Where the design asks for something the
backend cannot supply:

- **Do not invent an endpoint or fabricate plausible-looking data.**
- Render the honest state — indeterminate rather than a made-up percentage; "Open thread"
  rather than an inert "Approve"; a disabled control with a tooltip saying why.
- Leave a comment naming exactly what is missing.

A user who believes they approved a spend and did not is worse off than one who can see the
control is not wired.

### Known wire gotchas

- `session.info` is emitted in the `finally` of **every** turn; `message.complete` is skipped
  when the dispatcher throws. Clear busy state on the former.
- `thinking.delta` is a spinner face, not reasoning. `reasoning.delta` is the real thing.
  `reasoning.available` is the first 500 chars of the *answer*, mislabelled.
- `tool.start.context` already carries a human-readable label ("Listing skills") — render it
  rather than the raw tool name.
- `session.seeded` never arrives over `/api/ws`.

---

# Testing

Vitest + Testing Library, jsdom. `src/test/setup.ts` polyfills `matchMedia` against
`window.innerWidth` (default 1440) — set `window.innerWidth` in a test to exercise a breakpoint.

What is worth a test here: **pure functions with real logic** (schedule formatting, section
bucketing, filtering, grammar/counting) and **mount smoke tests** that a typecheck cannot catch —
a bad hook order, a missing provider, a null deref in a formatter. Assert on text and roles,
not on class names; a re-skin should not break the suite.

Run `npm run quality` before finishing. It is typecheck + lint + test, and it must be clean.

---

# Design fidelity

The design source is a canvas of five artboards. Its measurements are the spec for these
screens, but note two things that generalise:

1. **Where the canvas and imagine-computer-web disagree, the split is:** the monorepo owns
   tokens, components, mechanisms and accessibility; the canvas owns per-surface pixels
   (padding, radius, size, which token fills which slot). Where the canvas is *silent* — every
   responsive breakpoint, every focus state — the monorepo wins, because a single desktop
   artboard cannot be an authority on either.
2. **Verify by measuring, not by eye.** Read computed styles in the browser and compare against
   the spec. Several bugs on this port were found that way and would not have been spotted
   from a screenshot.

Reuse before building: `@repo/ui` for `Button` / `Badge` / `Skeleton` / `Tooltip` / `Sheet`,
`modules/core/components` for `EmployeeAvatar` / `AgentBlob` / `Spinner` / `AccountAvatar`.
Hand-rolling a div with the right classes instead of using the house component is how the two
codebases drift apart.
