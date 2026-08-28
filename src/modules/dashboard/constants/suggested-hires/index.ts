/**
 * The three agents D5 puts on its suggested-hire cards.
 *
 * **This is a temporary local copy and should be deleted.** The real list is
 * `src/modules/marketplace/constants/catalog`, and CLAUDE.md's one hard rule is
 * that a feature module imports from `modules/core` and `@repo/*` only — never
 * another feature module's internals. The fix is to promote the catalog into
 * `modules/core`, after which this file goes away and the three ids are looked
 * up there instead.
 *
 * Every field is copied verbatim from the catalog entry of the same id, so the
 * day the promotion happens the cards do not change. All three are ids in
 * `AVAILABLE_AGENT_IDS` — suggesting a gated-out agent would send the user to a
 * detail page that cannot resolve it.
 */
export interface SuggestedHire {
  /** Catalog id, which is also the Hermes profile slug Install would create. */
  id: string
  name: string
  tagline: string
}

export const SUGGESTED_HIRES: readonly SuggestedHire[] = [
  {
    id: 'ad-creator',
    name: 'Ad Creator',
    tagline: 'Turns a brand into on-brand ad creative and copy. Generates only; it publishes nothing.',
  },
  {
    id: 'linkedin-agent',
    name: 'LinkedIn Agent',
    tagline: 'Plans your week of LinkedIn posts and writes paste-ready drafts.',
  },
  {
    id: 'startup-kit-agent',
    name: 'Startup Kit',
    tagline: 'Turns an idea into a market read, a deck and projections you can defend.',
  },
]
