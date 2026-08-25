/**
 * The marketplace's shelf order.
 *
 * Hermes has no catalog backend and no notion of a category, so this list is
 * the only source of truth for both the filter chips and the section order on
 * the unfiltered page.
 */

export const AGENT_CATEGORIES = [
  'Personal',
  'Engineering',
  'Business Ops',
  'Content',
  'Research',
  'Creative',
  'Home & Devices',
  'Money',
  'Health & Wellbeing',
  'Comms',
  'Learning',
  'Security & Privacy',
  'Growth & Marketing',
] as const

export type AgentCategory = (typeof AGENT_CATEGORIES)[number]

/** The chip row: every category, preceded by the unfiltered default. */
export const CATEGORIES = ['All', ...AGENT_CATEGORIES] as const

export type MarketplaceCategory = (typeof CATEGORIES)[number]

/** One line under each section heading. Same register as the taglines. */
export const CATEGORY_SUBTITLES: Record<AgentCategory, string> = {
  Personal: 'The ones that hold your day together.',
  Engineering: 'They take the small work so you keep the hard part.',
  'Business Ops': 'Hiring, accounts, and the follow-ups nobody gets to.',
  Content: 'Scripts, cuts and covers, made to a brief.',
  Research: 'They read everything and hand back what matters.',
  Creative: 'Look and feel, from a rough idea to something you can ship.',
  'Home & Devices': 'They run the house while you are not thinking about it.',
  Money: 'Receipts, invoices, and the month-end close.',
  'Health & Wellbeing': 'Training and habits that fit the week you actually have.',
  Comms: 'Calls, replies, and the notes afterwards.',
  Learning: 'They turn reading into something that stays.',
  'Security & Privacy': 'They watch the doors and tell you what to close.',
  'Growth & Marketing': 'Launches, pages, and the posts around them.',
}
