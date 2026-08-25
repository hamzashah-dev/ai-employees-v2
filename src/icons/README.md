Mirror of `imagine-computer-web/packages/icons/src`, aliased as `@repo/icons/*`
(see `vite.config.ts` and `tsconfig.json` paths).

Kept as close to byte-identical with the monorepo source as this app's stricter tsconfig
allows, so it can be refreshed with `rsync` and deleted outright when this app is ported
back in. Because the alias matches the real package specifier, consumer imports
(`import { SearchIcon } from '@repo/icons/search'`) need no edits on port-back.

## Deviations from the source (redo these after any refresh)

**1. Dead `React` import (8 modules).** They ship `import React from 'react'` unused, which
this app's `noUnusedLocals: true` rejects (the monorepo does not enable it). Removed in:
`arrow-right`, `browsers/edge-browser`, `check-rectangle-icon`, `image-error-icon`,
`left-feather`, `right-feather`, `select-all-icon`, `zap`.

**2. Missing `viewBox` (29 modules).** They set `width`/`height` but no `viewBox`, so the SVG
has no user coordinate system to scale from: Tailwind's `size-*` resizes the CSS box while the
path keeps rendering at intrinsic coordinates, leaving the glyph cropped or off-centre. Caught
when `arrow-top-right-icon` rendered low-right at `size-3`. `viewBox="0 0 W H"` was derived
from each module's own `width`/`height` and added to: `add-user-icon`,
`ai-chat-outline-icon`, `ai-docs-outline-icon`, `ai-graphs-outline-icon`,
`ai-image-outline-icon`, `ai-music-outline-icon`, `ai-podcast-outline-icon`,
`ai-slides-outline-icon`, `ai-sparkles2-icon`, `ai-videos-outline-icon`,
`arrow-top-right-icon`, `bell-icon`, `crown-filled`, `deep-research-outline-icon`,
`hot-drink-icon`, `hourglass-icon`, `live-icon`, `lock-icon-2`, `memory-icon`,
`message-bubble-icon`, `not-allowed-icon`, `pencil-icon`, `personalize-icon`,
`rocket-2-icon`, `slide-deck-icon`, `trend-chart-icon`, `twitter`, `upgrade-plan-icon`,
`whatsapp-icon`. **Worth fixing upstream** — every consumer that sizes these by class is
affected, not just this app.

## Known defects inherited from the source

- **`strokeWidth="currentStroke"` in 228 modules** — not a valid SVG value, so browsers
  fall back to `stroke-width: 1` and those glyphs render thinner than the rest of the
  family. Pinned to 1.5 (the package's majority value) by a rule in `src/styles/globals.css`
  rather than patched here, to keep this a clean mirror.
- **`apps-icon` takes no props** — `FC` with no `className`, so it cannot be sized or
  coloured. Unused by this app; fix upstream before reaching for it.
- **Hardcoded `clipPath`/`mask` ids** (`id="a"`, `id="clip0_…"`) collide when two such
  icons render on one page — affects `paper-clip`, `play-circle`, `agent-chat-icon`,
  `hide-timeline-icon`, `show-timeline-icon` and others.
- `utils/dynamic-icon` and `utils/load-icon` are deliberately **not** mirrored: their
  template-literal `import()` needs `import.meta.glob` under Vite, and
  `Object.values(mod)[0]` is wrong for the multi-export modules.

## Name traps (do not substitute by name)

`store`→4 circles, not a storefront · `clock`→a *history* glyph, the real clock is
`time-clock-icon` · `spark`→lightning bolt, not a sparkle · `x`→plain cross, not the X
logo · `tools` (wrench) and `tools-icon` (ruler+pencil) **both export `ToolsIcon`** ·
`send-icon`→paper plane, chat send uses `arrow-up` · `file`→solid fill,
`file-text`→outline · `dropdown-icon`/`dorpdown-icon` are duplicate dirs, same export.
