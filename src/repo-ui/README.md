Mirror of `imagine-computer-web/packages/ui`, aliased as `@repo/ui/*` (components) and
`@repo/ui/cn` (see `vite.config.ts` and the `paths` in `tsconfig.json`).

Only the primitives this app actually uses are mirrored, rather than the whole package:
`cn/` (plus its `custom-tw-merge`), and `components/base/` — `button`, `badge`, `skeleton`,
`tooltip`, `sheet`, `visually-hidden`, `accordion`, `tabs`, `dropdown-menu`, `dialog`,
`segmented-controls`, `table`, `separator`.

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
   - `dialog/index.tsx` → `@radix-ui/react-dialog`
   - `separator/index.tsx` → `@radix-ui/react-separator`

   `tabs`, `segmented-controls` and `dropdown-menu` already import scoped packages
   upstream (`@radix-ui/react-tabs`, `@radix-ui/react-dropdown-menu`) and are copied as-is;
   `table` uses no Radix at all.
2. **`'use client'` directives stripped** — a Next.js directive, meaningless under Vite.
3. **`tabs/index.tsx` drops `AnimatedTabsTrigger` and the `HorizontalScrollShadowWrapper`
   around `TabsList`.** Both exist only for motion: the animated trigger needs `motion/react`,
   and the wrapper is a thin skin over `@heroui/scroll-shadow` (plus a Tailwind plugin, for
   its `scrollbar-none`) whose job is to fade the tab strip's edges. That is two whole
   packages for decoration on a component the design uses statically — §6 of the design spec
   asks for the plain `TabsTrigger` `secondary` variant, nothing animated. The scrolling half
   of the wrapper is kept as one `overflow-x-auto` container; the gradient masks and the
   left/right overflow buttons are gone. **On port-back the real `@repo/ui/tabs` restores
   both** — no consumer import changes, because no consumer uses `AnimatedTabsTrigger`.
4. **`segmented-controls/index.tsx` drops `SegmentedControlsAnimatedTrigger`** for the same
   reason — it is the file's only `motion/react` import, and D12's cadence control
   (`Daily`/`Weekdays`/`Weekly`/`Custom`) is a plain `SegmentedControlsTrigger`.
5. **`separator/index.tsx` drops upstream's `import * as React from 'react'`.** It was only
   ever used for the `React.Ref<…>` type, which the ambient `@types/react` namespace already
   supplies — the same thing every other mirror here relies on. Kept because
   `consistent-type-imports` would otherwise want it rewritten as a type-only namespace
   import, which is a bigger edit than deleting a line the file does not need.
6. **`mirror.test.tsx` is an addition, not a copy.** Six mount checks over the newer
   primitives, there to catch a refresh that silently changes the API this app leans on. It
   deliberately asserts variant names through the *typecheck* rather than by matching class
   strings: `variant` is a union derived from the cva config, so `variant="secondary"` in
   the test stops compiling the moment §6's secondary `TabsTrigger` stops shipping. Delete
   it on port-back along with the rest of the mirror.

## Not available upstream

`packages/ui` has **no input / text-field / textarea primitive** — not under
`components/base/`, not anywhere else in the package (there is a `form` and a `label`, both of
which wrap `react-hook-form` state and a `<label>`, neither of which renders a field). Nothing
in the package renders an `<input>` or a `<textarea>` at all. Text fields in
imagine-computer-web are hand-rolled per surface against the token layer, and they have to be
here too.

## Animation classes are inert here

The mirrored `sheet`, `dialog` and `dropdown-menu` carry `animate-in` / `fade-in-0` /
`zoom-in-95` / `slide-in-from-top-2` classes. Those are `tw-animate-css` utilities; upstream
`@repo/ui` pins `tw-animate-css@1.4.0` and this app does not import it, so Tailwind generates
nothing for them and they are dead class names. Kept verbatim rather than stripped — they cost
nothing and stripping them would be a deviation to maintain. Add
`@import 'tw-animate-css';` to `src/styles/tokens.css` (and the dependency) if a surface needs
the open/close transition to actually play.
