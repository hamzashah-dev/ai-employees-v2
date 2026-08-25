import type { AgentCategory } from '../categories'

/**
 * The agent catalog.
 *
 * Hermes exposes profiles, sessions and cron and nothing else — there is no
 * catalog, registry or discovery endpoint anywhere in its REST surface. So the
 * shelf is hand-authored here while Install is real: it POSTs a profile named
 * after `id`, which is why every id is a valid Hermes profile slug.
 *
 * `runs` and `installs` are the canvas's numbers. They are display copy, not
 * telemetry, and nothing in the app pretends otherwise.
 */

export interface CatalogAgent {
  id: string
  name: string
  tagline: string
  category: string
  runs: number
  installs: number
}

/**
 * Authored with `category` narrowed so a typo is a compile error rather than an
 * agent that silently belongs to no section on the page.
 */
type CatalogEntry = Omit<CatalogAgent, 'category'> & { category: AgentCategory }

const ENTRIES: readonly CatalogEntry[] = [
  {
    id: 'inbox-triage',
    name: 'Inbox Triage',
    tagline: 'Sorts the overnight inbox and tells you the three things that need you.',
    category: 'Personal',
    runs: 3481,
    installs: 4112,
  },
  {
    id: 'chief-of-staff',
    name: 'Chief of Staff',
    tagline: 'Holds the week, chases the threads, briefs you each morning.',
    category: 'Personal',
    runs: 2236,
    installs: 2914,
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    tagline: 'Reproduces the report, finds the cause, opens the fix.',
    category: 'Engineering',
    runs: 1544,
    installs: 2011,
  },
  {
    id: 'on-call-buddy',
    name: 'On-Call Buddy',
    tagline: 'Reads the alert, checks the dashboards, wakes you only if it is real.',
    category: 'Engineering',
    runs: 968,
    installs: 1327,
  },
  {
    id: 'talent-scout',
    name: 'Talent Scout',
    tagline: "Screens applicants and drafts intros you'd actually send.",
    category: 'Business Ops',
    runs: 862,
    installs: 1240,
  },
  {
    id: 'account-manager',
    name: 'Account Manager',
    tagline: 'Keeps CRM notes true and follows up before you remember to.',
    category: 'Business Ops',
    runs: 1207,
    installs: 1689,
  },
  {
    id: 'shorts-maker',
    name: 'Shorts Maker',
    tagline: 'Pick a look, vertical-ready, parallel render.',
    category: 'Content',
    runs: 1973,
    installs: 2630,
  },
  {
    id: 'script-writer',
    name: 'Script Writer',
    tagline: 'Writes production-ready scripts from a one-line brief.',
    category: 'Content',
    runs: 1418,
    installs: 1905,
  },
  {
    id: 'field-researcher',
    name: 'Field Researcher',
    tagline: 'Reads the whole field and comes back with a briefing you can cite.',
    category: 'Research',
    runs: 1655,
    installs: 2204,
  },
  {
    id: 'competitor-watch',
    name: 'Competitor Watch',
    tagline: 'Tracks the five companies you care about and flags what changed.',
    category: 'Research',
    runs: 774,
    installs: 1102,
  },
  {
    id: 'cover-artist',
    name: 'Cover Artist',
    tagline: 'Turns a rough idea into cover art you can ship today.',
    category: 'Creative',
    runs: 1288,
    installs: 1703,
  },
  {
    id: 'brand-keeper',
    name: 'Brand Keeper',
    tagline: 'Checks every draft against the brand and says where it drifts.',
    category: 'Creative',
    runs: 596,
    installs: 917,
  },
  {
    id: 'home-keeper',
    name: 'Home Keeper',
    tagline: 'Runs the house routines and tells you when something is off.',
    category: 'Home & Devices',
    runs: 641,
    installs: 988,
  },
  {
    id: 'expense-clerk',
    name: 'Expense Clerk',
    tagline: 'Files the receipts, catches the double charges, closes the month.',
    category: 'Money',
    runs: 1093,
    installs: 1487,
  },
  {
    id: 'invoice-chaser',
    name: 'Invoice Chaser',
    tagline: "Sends the polite reminder on day 31 so you don't have to.",
    category: 'Money',
    runs: 528,
    installs: 803,
  },
  {
    id: 'training-partner',
    name: 'Training Partner',
    tagline: "Plans the week's training around the days you actually have.",
    category: 'Health & Wellbeing',
    runs: 712,
    installs: 1044,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    tagline: 'Joins the call, listens, and leaves behind decisions and owners.',
    category: 'Comms',
    runs: 2604,
    installs: 3218,
  },
  {
    id: 'reply-drafter',
    name: 'Reply Drafter',
    tagline: 'Drafts the replies in your voice and waits for your nod.',
    category: 'Comms',
    runs: 1832,
    installs: 2377,
  },
  {
    id: 'study-coach',
    name: 'Study Coach',
    tagline: "Turns what you're reading into questions you can't fake.",
    category: 'Learning',
    runs: 486,
    installs: 774,
  },
  {
    id: 'access-auditor',
    name: 'Access Auditor',
    tagline: 'Reviews who can reach what and tells you what to revoke.',
    category: 'Security & Privacy',
    runs: 559,
    installs: 861,
  },
  {
    id: 'launch-planner',
    name: 'Launch Planner',
    tagline: 'Sequences the launch and writes every post it needs.',
    category: 'Growth & Marketing',
    runs: 1176,
    installs: 1602,
  },
  {
    id: 'seo-editor',
    name: 'SEO Editor',
    tagline: 'Rewrites the page for the query people actually type.',
    category: 'Growth & Marketing',
    runs: 803,
    installs: 1211,
  },
]

export const CATALOG: CatalogAgent[] = [...ENTRIES]
