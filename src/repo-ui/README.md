Mirror of `imagine-computer-web/packages/ui`, aliased as `@repo/ui/*` (components) and
`@repo/ui/cn` (see `vite.config.ts` and the `paths` in `tsconfig.json`).

Only the primitives this app actually uses are mirrored, rather than the whole package:
`cn/` (plus its `custom-tw-merge`), and `components/base/` — `button`, `badge`, `skeleton`,
`tooltip`, `sheet`, `visually-hidden`, `accordion`.

Kept as close to the monorepo source as this app's toolchain allows, so it can be refreshed
with `rsync` and deleted outright on port-back. Because the aliases match the real package
specifiers, consumer imports (`import { Button } from '@repo/ui/button'`) need no edits.

`cn` is the one to be careful with: it wraps `extendTailwindMerge` with class groups for the
custom `text-label-*` / `text-heading-*` scales. Swap it for a bare `twMerge` and
`text-label-sm` is silently classified as a *text colour* and dropped whenever it merges with
`text-secondary` — the type scale vanishes and the line renders at body size.

## Deviations from the source (redo these after any refresh)

1. **Radix imports are scoped, not the umbrella.** Upstream imports from the `radix-ui`
   umbrella package, which would pull in every primitive for the handful used here. Each
   mirrored component imports the scoped package instead, with an inline comment saying so:
   - `button/index.tsx` → `@radix-ui/react-slot` (and `SlotPrimitive.Slot` → `Slot`, since the
     scoped package exports it directly)
   - `sheet/index.tsx` → `@radix-ui/react-dialog`
   - `visually-hidden/index.tsx` → `@radix-ui/react-visually-hidden`
   - `accordion/index.tsx` → `@radix-ui/react-accordion` + `@radix-ui/react-slot`
2. **`'use client'` directives stripped** — a Next.js directive, meaningless under Vite.
