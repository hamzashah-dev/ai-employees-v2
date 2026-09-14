/**
 * The job props an employee's avatar can wear — the vocabulary of what an employee *does*.
 *
 * A prop is the logo on the cap. It is a claim about the job, which is why there is a
 * `meaning` for each and why nothing anywhere derives one from a hash: `resolveProp` in
 * `utils/identity` only ever answers from `assignments.ts` or the user's own choice.
 *
 * The artwork lives next door in `glyphs.tsx`: one monochrome `@repo/icons` component per id,
 * drawn in the face colour on the cap. It used to be forty vendored multicolour illustrations
 * with a hue-collision solver to keep them legible against the body; a single-colour glyph on
 * a dark cap needs neither, so both went.
 *
 * This file is the source of truth for the *ids*. Adding a prop means a row here, a glyph in
 * `glyphs.tsx` (the test that every id has one will tell you), and usually a row in
 * `assignments.ts`.
 */

export interface AvatarProp {
  /** What wearing this prop claims about the job. Drives a picker's accessible name. */
  meaning: string
}

export const AVATAR_PROPS = {
  'search': { meaning: 'Research, finding, discovery' },
  'binoculars': { meaning: 'Watching, monitoring a target' },
  'inspection': { meaning: 'Audit, review, verification' },
  'survey': { meaning: 'Surveys, free-text analysis' },
  'calendar': { meaning: 'Scheduling, the week' },
  'alarm-clock': { meaning: 'Reminders, sleep, time' },
  'todo-list': { meaning: 'Tasks, admin, checklists' },
  'manager': { meaning: 'Leadership, holding the week' },
  'conference-call': { meaning: 'People, hiring, community' },
  'businessman': { meaning: 'Accounts, individual contacts' },
  'briefcase': { meaning: 'Business operations, vendors' },
  'command-line': { meaning: 'Code, shells, engineering' },
  'deployment': { meaning: 'Releases, on-call, shipping code' },
  'puzzle': { meaning: 'Tests, dependencies, integrations' },
  'document': { meaning: 'Writing, drafts, documentation' },
  'news': { meaning: 'Publishing, newsletters, blogs' },
  'reading': { meaning: 'Reading, study, papers' },
  'graduation-cap': { meaning: 'Learning, tutoring, exams' },
  'calculator': { meaning: 'Numbers, tax, budgeting' },
  'currency-exchange': { meaning: 'Money movement, invoices' },
  'bullish': { meaning: 'Growth, performance up' },
  'line-chart': { meaning: 'Analytics, trends' },
  'bar-chart': { meaning: 'Reporting, comparison' },
  'advertising': { meaning: 'Marketing, ads, campaigns' },
  'headset': { meaning: 'Support, live help' },
  'comments': { meaning: 'Replies, chat, threads' },
  'picture': { meaning: 'Visual design, thumbnails, art' },
  'music': { meaning: 'Audio, podcast, sound' },
  'film-reel': { meaning: 'Video, clips, shorts' },
  'idea': { meaning: 'Ideation, strategy, launch' },
  'signature': { meaning: 'Contracts, policy, legal' },
  'package': { meaning: 'Shipping, procurement, parcels' },
  'shop': { meaning: 'Shopping, groceries, gifts' },
  'home': { meaning: 'Home automation' },
  'electricity': { meaning: 'Energy, devices, repair' },
  'privacy': { meaning: 'Security, privacy, breaches' },
  'key': { meaning: 'Access, secrets, credentials' },
  'data-backup': { meaning: 'Backups, restores' },
  'globe': { meaning: 'Travel, language, world' },
  'like': { meaning: 'Health, wellbeing, habits' },
} as const satisfies Record<string, AvatarProp>

export type AvatarPropId = keyof typeof AVATAR_PROPS

export const AVATAR_PROP_IDS = Object.keys(AVATAR_PROPS) as AvatarPropId[]

export const isAvatarPropId = (value: unknown): value is AvatarPropId =>
  typeof value === 'string' && value in AVATAR_PROPS

export { AVATAR_PROP_GLYPHS } from './glyphs'
