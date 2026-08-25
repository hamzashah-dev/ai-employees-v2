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
 * day the promotion happens the cards do not change. All three are §6 names.
 */
export interface SuggestedHire {
  /** Catalog id, which is also the Hermes profile slug Install would create. */
  id: string
  name: string
  tagline: string
}

export const SUGGESTED_HIRES: readonly SuggestedHire[] = [
  {
    id: 'inbox-triage',
    name: 'Inbox Triage',
    tagline: 'Sorts the overnight inbox and tells you the three things that need you.',
  },
  {
    id: 'expense-manager',
    name: 'Expense Manager',
    tagline: "Pulls receipts, codes them, and flags only what it can't decide.",
  },
  {
    id: 'sales-outbound',
    name: 'Sales Outbound',
    tagline: 'Researches prospects and drafts sequences in your voice.',
  },
]
