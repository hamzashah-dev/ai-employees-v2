import type { AgentCategory } from '../categories'
import { CONNECTORS, type Connector, type ConnectorId } from '../connectors'

/**
 * The agent catalog.
 *
 * Hermes exposes profiles, sessions and cron and nothing else — there is no
 * catalog, registry or discovery endpoint anywhere in its REST surface. So the
 * shelf is hand-authored here while Install is real: it POSTs a profile named
 * after `id`, which is why every id is a valid Hermes profile slug.
 *
 * `runs` and `installs` are the canvas's numbers. They are display copy, not
 * telemetry, and nothing in the app pretends otherwise. Installs sit a little
 * above runs throughout, matching §6's own card (`1,973 runs` · `2,630`); a
 * genuinely new agent shows `0 runs` and a small install count.
 *
 * ## The detail fields
 *
 * `duties`, `connectors`, `requirements` and `howItWorks` feed the agent detail
 * surface (§6 "Agent detail", D17). They are optional, and only twelve agents
 * carry them: the nine §6 names the design pins as the real catalogue, plus
 * `bug-hunter`, `meeting-notes` and `social-scheduler` — enough to exercise the
 * screen with a value-only requirement set, the longest connector list, and a
 * social one. The rest deliberately go without: a requirement list is a promise
 * about what an agent will ask you for, and inventing ninety of them would be
 * the fabrication CLAUDE.md rules out. A card whose detail is absent should say
 * so rather than render an empty block.
 *
 * `addedAt` is different — it is a single display date, so every entry carries
 * one and `CatalogEntry` makes omitting it a compile error. It stays optional on
 * `CatalogAgent` only so existing test fixtures keep compiling; the invariant
 * test asserts the real catalog is complete.
 */

/**
 * One row of the "Needs from you" checklist.
 *
 * `satisfiedBy` says which affordance clears the row: `connector` means
 * connecting the named service, `value` means the user supplies a string —
 * which is real, per-profile, and lands in Hermes's env store
 * (`PUT /api/env?profile=`). Connector state has no backend to read, so the row
 * can state the need and offer the action but must not claim it is met.
 */
export interface AgentRequirement {
  /** The thing being asked for, written as the user will see it named. */
  name: string
  /** Why the agent needs it — one line, no second clause. */
  why: string
  satisfiedBy: 'connector' | 'value'
  /** Set when `satisfiedBy` is `connector`: which chip clears this row. */
  connector?: ConnectorId
}

export interface CatalogAgent {
  id: string
  name: string
  tagline: string
  category: string
  runs: number
  installs: number
  /** ISO date the agent joined the catalog. What "Newest" sorts on. */
  addedAt?: string
  /** "What it does" — four one-line duties. */
  duties?: readonly [string, string, string, string]
  /** "Connects to" — the services it is wired to. */
  connectors?: readonly Connector[]
  /** "Needs from you" — the checklist that gates a useful first run. */
  requirements?: readonly AgentRequirement[]
  /** "How it works" — three quiet lines of operating defaults. */
  howItWorks?: readonly [string, string, string]
  /**
   * The agent's `SOUL.md` — the system prompt Hermes loads on every run.
   *
   * Install writes this to `PUT /api/profiles/{id}/soul`. Without it a new
   * profile keeps the stock Computer Agent boilerplate, so a hired "LinkedIn
   * Agent" introduces itself as a general assistant and lists code and email
   * among its skills — the identity on the card and the identity in the thread
   * disagree.
   *
   * Optional, and a hand-authored one always wins — it can say things the card
   * cannot, like which of a skill's own steps to refuse.
   *
   * When it is absent, `utils/compose-soul` builds one from this entry's own
   * copy rather than leaving the stock boilerplate: two hand-written souls
   * would have left the other ninety-five agents introducing themselves as
   * "Computer Agent", which is the bug, not a smaller version of it.
   *
   * That composition QUOTES the tagline instead of rewriting it, and the
   * reason is a real hazard rather than fussiness: "Sorts the overnight inbox
   * and tells **you** the three things" means the owner, and rephrasing it into
   * second person would make it mean the agent's own inbox. Quoting it as how
   * the role was advertised is both true and grammatical.
   */
  soul?: string
}

/**
 * Authored with `category` narrowed so a typo is a compile error rather than an
 * agent that silently belongs to no section on the page, and with `addedAt`
 * required so no entry can slip into the catalog without a sort key.
 */
type CatalogEntry = Omit<CatalogAgent, 'category' | 'addedAt'> & {
  category: AgentCategory
  addedAt: string
}

const ENTRIES: readonly CatalogEntry[] = [
  /* Personal */
  {
    id: 'inbox-triage',
    name: 'Inbox Triage',
    tagline: 'Sorts the overnight inbox and tells you the three things that need you.',
    category: 'Personal',
    runs: 3481,
    installs: 4112,
    addedAt: '2025-01-14',
    duties: [
      'Reads every overnight message and sorts it into reply, later, or ignore.',
      'Writes a three-line brief naming what actually needs you today.',
      'Drafts the routine replies and leaves them unsent.',
      'Files receipts and newsletters where you already keep them.',
    ],
    connectors: [CONNECTORS.gmail, CONNECTORS.slack, CONNECTORS['google-calendar']],
    requirements: [
      {
        name: 'Gmail account',
        why: 'It reads and labels the inbox it triages.',
        satisfiedBy: 'connector',
        connector: 'gmail',
      },
      {
        name: 'Slack workspace',
        why: 'It posts the morning brief where you already read.',
        satisfiedBy: 'connector',
        connector: 'slack',
      },
      {
        name: 'BRIEF_TIME',
        why: 'The hour the brief should land, in your timezone.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Runs once at your brief time, and again if the inbox doubles.',
      'Drafts, never sends — every reply waits for your nod.',
      'Reads the last 24 hours unless you ask it to go further back.',
    ],
  },
  {
    id: 'chief-of-staff',
    name: 'Chief of Staff',
    tagline: 'Holds the week, chases the threads, briefs you each morning.',
    category: 'Personal',
    runs: 2236,
    installs: 2914,
    addedAt: '2025-01-27',
    duties: [
      'Holds the week and tells you what moved overnight.',
      'Chases the threads that are waiting on other people.',
      'Briefs you each morning in five lines.',
      'Keeps the follow-ups you promised in the room.',
    ],
    connectors: [
      CONNECTORS['google-calendar'],
      CONNECTORS.gmail,
      CONNECTORS.slack,
      CONNECTORS.notion,
    ],
    requirements: [
      {
        name: 'Google Calendar',
        why: 'It reads the week it is holding.',
        satisfiedBy: 'connector',
        connector: 'google-calendar',
      },
      {
        name: 'Slack workspace',
        why: 'Where it chases, and where it briefs.',
        satisfiedBy: 'connector',
        connector: 'slack',
      },
      {
        name: 'BRIEF_TIME',
        why: 'When the morning brief should land.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Briefs once a day; interrupts only for something dated today.',
      'Chases a thread twice, then hands it back to you.',
      'Never accepts or declines on your behalf.',
    ],
  },
  {
    id: 'calendar-keeper',
    name: 'Calendar Keeper',
    tagline: 'Guards the week, moves what can move, protects the long blocks.',
    category: 'Personal',
    runs: 1904,
    installs: 2388,
    addedAt: '2025-03-09',
  },
  {
    id: 'day-planner',
    name: 'Day Planner',
    tagline: "Turns tomorrow's list into a day that actually fits.",
    category: 'Personal',
    runs: 1512,
    installs: 1974,
    addedAt: '2025-04-21',
  },
  {
    id: 'travel-planner',
    name: 'Travel Planner',
    tagline: 'Books the trip end to end and hands you one itinerary.',
    category: 'Personal',
    runs: 1187,
    installs: 1616,
    addedAt: '2025-05-06',
  },
  {
    id: 'life-admin',
    name: 'Life Admin',
    tagline: 'Renewals, forms and appointments, handled before they expire.',
    category: 'Personal',
    runs: 968,
    installs: 1342,
    addedAt: '2025-07-18',
  },
  {
    id: 'errand-runner',
    name: 'Errand Runner',
    tagline: 'Keeps the small jobs moving so none of them reach the weekend.',
    category: 'Personal',
    runs: 744,
    installs: 1085,
    addedAt: '2025-09-02',
  },
  {
    id: 'personal-shopper',
    name: 'Personal Shopper',
    tagline: 'Compares the options, reads the reviews, brings you two.',
    category: 'Personal',
    runs: 613,
    installs: 902,
    addedAt: '2025-11-11',
  },
  {
    id: 'gift-finder',
    name: 'Gift Finder',
    tagline: "Remembers the dates and finds something they'll keep.",
    category: 'Personal',
    runs: 402,
    installs: 655,
    addedAt: '2026-02-24',
  },

  /* Engineering */
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    tagline: 'Reproduces the report, finds the cause, opens the fix.',
    category: 'Engineering',
    runs: 1544,
    installs: 2011,
    addedAt: '2025-02-11',
    duties: [
      'Reproduces the report before it believes it.',
      'Bisects to the commit that introduced the behaviour.',
      'Opens a fix with the failing test already attached.',
      'Closes the report in the words the reporter used.',
    ],
    connectors: [CONNECTORS.slack, CONNECTORS.notion],
    requirements: [
      {
        name: 'REPO_PATH',
        why: 'The checkout it reproduces and bisects in.',
        satisfiedBy: 'value',
      },
      {
        name: 'TEST_COMMAND',
        why: 'How it proves the bug, and later the fix.',
        satisfiedBy: 'value',
      },
      {
        name: 'Slack workspace',
        why: 'Where the report arrives and the fix is announced.',
        satisfiedBy: 'connector',
        connector: 'slack',
      },
    ],
    howItWorks: [
      'Works on a branch of its own and never pushes to main.',
      'Stops at three failed reproductions and says what it tried.',
      'Runs the full suite before it opens anything.',
    ],
  },
  {
    id: 'on-call-buddy',
    name: 'On-Call Buddy',
    tagline: 'Reads the alert, checks the dashboards, wakes you only if it is real.',
    category: 'Engineering',
    runs: 968,
    installs: 1327,
    addedAt: '2025-02-25',
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    tagline: 'Reads the diff before your teammates do and says what it would change.',
    category: 'Engineering',
    runs: 2418,
    installs: 3006,
    addedAt: '2025-03-17',
  },
  {
    id: 'release-manager',
    name: 'Release Manager',
    tagline: 'Cuts the release, writes the notes, tells the channel it shipped.',
    category: 'Engineering',
    runs: 1276,
    installs: 1708,
    addedAt: '2025-04-30',
  },
  {
    id: 'test-writer',
    name: 'Test Writer',
    tagline: 'Covers the paths you skipped and leaves the suite green.',
    category: 'Engineering',
    runs: 1633,
    installs: 2094,
    addedAt: '2025-06-12',
  },
  {
    id: 'dependency-warden',
    name: 'Dependency Warden',
    tagline: 'Bumps what is safe and opens a pull request for what is not.',
    category: 'Engineering',
    runs: 1105,
    installs: 1487,
    addedAt: '2025-08-05',
  },
  {
    id: 'docs-keeper',
    name: 'Docs Keeper',
    tagline: 'Follows the code and fixes the docs it just made wrong.',
    category: 'Engineering',
    runs: 856,
    installs: 1203,
    addedAt: '2025-10-14',
  },
  {
    id: 'performance-profiler',
    name: 'Performance Profiler',
    tagline: 'Finds the slow query, proves it, and proposes the index.',
    category: 'Engineering',
    runs: 641,
    installs: 944,
    addedAt: '2025-12-09',
  },
  {
    id: 'incident-scribe',
    name: 'Incident Scribe',
    tagline: 'Keeps the timeline during the incident and writes it up after.',
    category: 'Engineering',
    runs: 488,
    installs: 737,
    addedAt: '2026-03-16',
  },

  /* Business Ops */
  {
    id: 'talent-scout',
    name: 'Talent Scout',
    tagline: "Screens applicants and drafts intros you'd actually send.",
    category: 'Business Ops',
    runs: 862,
    installs: 1240,
    addedAt: '2025-01-21',
    duties: [
      'Reads every application against the role, not the keywords.',
      'Ranks a shortlist and says why each name is on it.',
      'Drafts the intro or the rejection, both in your voice.',
      'Books the first call once you pick.',
    ],
    connectors: [
      CONNECTORS.gmail,
      CONNECTORS['google-drive'],
      CONNECTORS.linkedin,
      CONNECTORS['google-calendar'],
    ],
    requirements: [
      {
        name: 'Gmail account',
        why: 'Applications arrive as mail; it reads and replies there.',
        satisfiedBy: 'connector',
        connector: 'gmail',
      },
      {
        name: 'Google Drive folder',
        why: 'Where the CVs it reads already live.',
        satisfiedBy: 'connector',
        connector: 'google-drive',
      },
      {
        name: 'ROLE_BRIEF',
        why: 'The one page it screens every applicant against.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Screens in batches, once a day, never mid-application.',
      'Sends no rejection without you reading it first.',
      'Keeps its reasons attached to each name it ranks.',
    ],
  },
  {
    id: 'account-manager',
    name: 'Account Manager',
    tagline: 'Keeps CRM notes true and follows up before you remember to.',
    category: 'Business Ops',
    runs: 1207,
    installs: 1689,
    addedAt: '2025-02-04',
    duties: [
      'Reads every thread and keeps the account notes true.',
      'Follows up on the promise nobody wrote down.',
      'Flags the account that has gone quiet.',
      'Writes the renewal summary a month before the date.',
    ],
    connectors: [CONNECTORS.gmail, CONNECTORS.notion, CONNECTORS.slack],
    requirements: [
      {
        name: 'Gmail account',
        why: 'The thread is the record, so it reads the thread.',
        satisfiedBy: 'connector',
        connector: 'gmail',
      },
      {
        name: 'Notion database',
        why: 'Where the account notes already live.',
        satisfiedBy: 'connector',
        connector: 'notion',
      },
      {
        name: 'QUIET_DAYS',
        why: 'How long an account may go silent before it tells you.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Updates notes daily; nudges you weekly, not hourly.',
      'Writes to the account record, never to the customer.',
      'Leaves a note saying which thread each change came from.',
    ],
  },
  {
    id: 'meeting-scheduler',
    name: 'Meeting Scheduler',
    tagline: 'Finds the slot everyone can take and sends the invite.',
    category: 'Business Ops',
    runs: 2044,
    installs: 2571,
    addedAt: '2025-03-25',
  },
  {
    id: 'onboarding-buddy',
    name: 'Onboarding Buddy',
    tagline: "Walks a new hire through week one and answers what they don't ask.",
    category: 'Business Ops',
    runs: 1318,
    installs: 1742,
    addedAt: '2025-05-19',
  },
  {
    id: 'contract-reader',
    name: 'Contract Reader',
    tagline: 'Reads the contract and marks the three clauses worth arguing.',
    category: 'Business Ops',
    runs: 1096,
    installs: 1488,
    addedAt: '2025-06-30',
  },
  {
    id: 'vendor-manager',
    name: 'Vendor Manager',
    tagline: 'Tracks the renewals and tells you what each vendor cost this year.',
    category: 'Business Ops',
    runs: 812,
    installs: 1164,
    addedAt: '2025-08-22',
  },
  {
    id: 'ops-reporter',
    name: 'Ops Reporter',
    tagline: "Pulls the week's numbers into one page before Monday.",
    category: 'Business Ops',
    runs: 977,
    installs: 1305,
    addedAt: '2025-09-29',
  },
  {
    id: 'purchase-clerk',
    name: 'Purchase Clerk',
    tagline: 'Collects the quotes and lays them side by side.',
    category: 'Business Ops',
    runs: 534,
    installs: 828,
    addedAt: '2025-12-01',
  },
  {
    id: 'policy-keeper',
    name: 'Policy Keeper',
    tagline: 'Keeps the handbook current and answers from it, not from memory.',
    category: 'Business Ops',
    runs: 421,
    installs: 689,
    addedAt: '2026-04-07',
  },

  /* Content */
  {
    id: 'shorts-maker',
    name: 'Shorts Maker',
    tagline: 'Pick a look, vertical-ready, parallel render.',
    category: 'Content',
    runs: 1973,
    installs: 2630,
    addedAt: '2025-01-09',
    duties: [
      'Cuts the long video into vertical clips that stand on their own.',
      'Picks the look once and holds it across the whole set.',
      'Burns captions timed to the speech, not the beat.',
      'Renders the set in parallel and hands you the folder.',
    ],
    connectors: [CONNECTORS['google-drive'], CONNECTORS.youtube, CONNECTORS.instagram],
    requirements: [
      {
        name: 'Google Drive folder',
        why: 'Where the source footage and the renders live.',
        satisfiedBy: 'connector',
        connector: 'google-drive',
      },
      {
        name: 'YouTube channel',
        why: 'It uploads as drafts, never straight to public.',
        satisfiedBy: 'connector',
        connector: 'youtube',
      },
      {
        name: 'ASPECT_PRESET',
        why: 'The frame it cuts to: 9:16, 4:5, or both.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Renders at most six clips a pass, in parallel.',
      'Keeps the source untouched and writes beside it.',
      'Uploads nothing public without you pressing publish.',
    ],
  },
  {
    id: 'script-writer',
    name: 'Script Writer',
    tagline: 'Writes production-ready scripts from a one-line brief.',
    category: 'Content',
    runs: 1418,
    installs: 1905,
    addedAt: '2025-01-31',
    duties: [
      'Turns a one-line brief into a shooting script.',
      'Writes to a length, not to a feeling.',
      'Marks the b-roll it expects you to already have.',
      'Rewrites the hook three ways and says which it would use.',
    ],
    connectors: [CONNECTORS.notion, CONNECTORS['google-drive']],
    requirements: [
      {
        name: 'Notion database',
        why: 'The brief board it takes its next job from.',
        satisfiedBy: 'connector',
        connector: 'notion',
      },
      {
        name: 'Google Drive folder',
        why: 'Where each draft is saved and versioned.',
        satisfiedBy: 'connector',
        connector: 'google-drive',
      },
      {
        name: 'SCRIPT_LENGTH',
        why: 'Target runtime, so it writes to time rather than to taste.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'One draft per brief; it revises rather than starts over.',
      'Keeps your last ten scripts in view for voice.',
      'Never invents a statistic it cannot link.',
    ],
  },
  {
    id: 'blog-drafter',
    name: 'Blog Drafter',
    tagline: 'Turns an outline into a draft with the links already in it.',
    category: 'Content',
    runs: 1655,
    installs: 2142,
    addedAt: '2025-03-03',
  },
  {
    id: 'newsletter-editor',
    name: 'Newsletter Editor',
    tagline: 'Writes the issue on the day you said and shows it to you first.',
    category: 'Content',
    runs: 1288,
    installs: 1703,
    addedAt: '2025-04-14',
  },
  {
    id: 'caption-writer',
    name: 'Caption Writer',
    tagline: 'Cuts captions and subtitles that match how people actually watch.',
    category: 'Content',
    runs: 1042,
    installs: 1416,
    addedAt: '2025-05-27',
  },
  {
    id: 'thumbnail-artist',
    name: 'Thumbnail Artist',
    tagline: 'Makes three thumbnails and says which one it would ship.',
    category: 'Content',
    runs: 913,
    installs: 1288,
    addedAt: '2025-07-08',
  },
  {
    id: 'podcast-producer',
    name: 'Podcast Producer',
    tagline: 'Cleans the audio, marks the chapters, writes the show notes.',
    category: 'Content',
    runs: 702,
    installs: 1037,
    addedAt: '2025-10-06',
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    tagline: 'Keeps the month planned and says what is late.',
    category: 'Content',
    runs: 587,
    installs: 874,
    addedAt: '2026-01-13',
  },
  {
    id: 'clip-finder',
    name: 'Clip Finder',
    tagline: 'Watches the long cut and pulls the moments worth posting.',
    category: 'Content',
    runs: 0,
    installs: 34,
    addedAt: '2026-08-17',
  },

  /* Research */
  {
    id: 'field-researcher',
    name: 'Field Researcher',
    tagline: 'Reads the whole field and comes back with a briefing you can cite.',
    category: 'Research',
    runs: 1655,
    installs: 2204,
    addedAt: '2025-02-18',
  },
  {
    id: 'competitor-watch',
    name: 'Competitor Watch',
    tagline: 'Tracks the five companies you care about and flags what changed.',
    category: 'Research',
    runs: 774,
    installs: 1102,
    addedAt: '2025-03-31',
  },
  {
    id: 'paper-reader',
    name: 'Paper Reader',
    tagline: 'Reads the paper, checks the method, tells you if it holds.',
    category: 'Research',
    runs: 1093,
    installs: 1451,
    addedAt: '2025-06-02',
  },
  {
    id: 'market-sizer',
    name: 'Market Sizer',
    tagline: 'Builds the number out of sources you can open yourself.',
    category: 'Research',
    runs: 668,
    installs: 971,
    addedAt: '2025-08-11',
  },
  {
    id: 'due-diligence',
    name: 'Due Diligence',
    tagline: 'Digs through the filings and lists what to ask about.',
    category: 'Research',
    runs: 512,
    installs: 796,
    addedAt: '2025-11-24',
  },
  {
    id: 'survey-analyst',
    name: 'Survey Analyst',
    tagline: 'Reads every free-text answer and names the five themes.',
    category: 'Research',
    runs: 447,
    installs: 703,
    addedAt: '2026-05-12',
  },

  /* Creative */
  {
    id: 'cover-artist',
    name: 'Cover Artist',
    tagline: 'Turns a rough idea into cover art you can ship today.',
    category: 'Creative',
    runs: 1288,
    installs: 1703,
    addedAt: '2025-02-07',
  },
  {
    id: 'brand-keeper',
    name: 'Brand Keeper',
    tagline: 'Checks every draft against the brand and says where it drifts.',
    category: 'Creative',
    runs: 596,
    installs: 917,
    addedAt: '2025-04-02',
  },
  {
    id: 'moodboard-maker',
    name: 'Moodboard Maker',
    tagline: 'Turns a vague feeling into twelve references and a palette.',
    category: 'Creative',
    runs: 1174,
    installs: 1552,
    addedAt: '2025-05-13',
  },
  {
    id: 'slide-designer',
    name: 'Slide Designer',
    tagline: 'Rebuilds the deck so each slide says one thing.',
    category: 'Creative',
    runs: 1416,
    installs: 1837,
    addedAt: '2025-07-01',
  },
  {
    id: 'logo-explorer',
    name: 'Logo Explorer',
    tagline: 'Sketches the marks worth arguing about, in black and white first.',
    category: 'Creative',
    runs: 638,
    installs: 954,
    addedAt: '2025-09-16',
  },
  {
    id: 'sound-designer',
    name: 'Sound Designer',
    tagline: 'Scores the cut and hands back stems you can move.',
    category: 'Creative',
    runs: 394,
    installs: 627,
    addedAt: '2026-06-08',
  },

  /* Home & Devices */
  {
    id: 'home-keeper',
    name: 'Home Keeper',
    tagline: 'Runs the house routines and tells you when something is off.',
    category: 'Home & Devices',
    runs: 641,
    installs: 988,
    addedAt: '2025-03-11',
  },
  {
    id: 'grocery-planner',
    name: 'Grocery Planner',
    tagline: 'Plans the meals, writes the list, keeps the basket honest.',
    category: 'Home & Devices',
    runs: 1502,
    installs: 1913,
    addedAt: '2025-04-08',
  },
  {
    id: 'package-tracker',
    name: 'Package Tracker',
    tagline: "Knows what's in transit and tells you when it's late.",
    category: 'Home & Devices',
    runs: 1121,
    installs: 1476,
    addedAt: '2025-06-24',
  },
  {
    id: 'energy-watcher',
    name: 'Energy Watcher',
    tagline: 'Watches the meter and names what is costing you.',
    category: 'Home & Devices',
    runs: 703,
    installs: 1049,
    addedAt: '2025-08-29',
  },
  {
    id: 'repair-scheduler',
    name: 'Repair Scheduler',
    tagline: "Books the trade, chases the quote, tells you when they're coming.",
    category: 'Home & Devices',
    runs: 486,
    installs: 762,
    addedAt: '2025-11-04',
  },
  {
    id: 'device-medic',
    name: 'Device Medic',
    tagline: 'Notices what stopped reporting and tries the boring fixes first.',
    category: 'Home & Devices',
    runs: 358,
    installs: 591,
    addedAt: '2026-05-26',
  },

  /* Money */
  {
    id: 'expense-manager',
    name: 'Expense Manager',
    tagline: "Pulls receipts, codes them, and flags only what it can't decide.",
    category: 'Money',
    runs: 2871,
    installs: 3402,
    addedAt: '2025-01-16',
    duties: [
      'Pulls receipts out of the inbox and matches them to card charges.',
      'Codes each one to a category and a cost centre.',
      'Flags only the charges it cannot decide, with its reason attached.',
      'Closes the month into the sheet your accountant already reads.',
    ],
    connectors: [
      CONNECTORS.gmail,
      CONNECTORS['google-drive'],
      CONNECTORS['google-sheets'],
      CONNECTORS.slack,
    ],
    requirements: [
      {
        name: 'Gmail account',
        why: 'Receipts arrive as mail; it reads only the labelled ones.',
        satisfiedBy: 'connector',
        connector: 'gmail',
      },
      {
        name: 'Google Drive folder',
        why: 'Where it files the receipt PDFs it keeps.',
        satisfiedBy: 'connector',
        connector: 'google-drive',
      },
      {
        name: 'SLACK_BOT_TOKEN',
        why: 'Lets it ask you about a charge it cannot code.',
        satisfiedBy: 'value',
      },
      {
        name: 'EXPENSE_SHEET_ID',
        why: 'The sheet it writes the closed month into.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Runs nightly, and once more on the first to close the month.',
      'Never files a charge it could not match — those wait for you.',
      'Reads only mail you have labelled, not the whole inbox.',
    ],
  },
  {
    id: 'expense-clerk',
    name: 'Expense Clerk',
    tagline: 'Files the receipts, catches the double charges, closes the month.',
    category: 'Money',
    runs: 1093,
    installs: 1487,
    addedAt: '2025-03-05',
  },
  {
    id: 'invoice-chaser',
    name: 'Invoice Chaser',
    tagline: "Sends the polite reminder on day 31 so you don't have to.",
    category: 'Money',
    runs: 528,
    installs: 803,
    addedAt: '2025-04-25',
  },
  {
    id: 'subscription-auditor',
    name: 'Subscription Auditor',
    tagline: 'Lists every recurring charge and what you last used it for.',
    category: 'Money',
    runs: 1744,
    installs: 2203,
    addedAt: '2025-05-20',
  },
  {
    id: 'budget-keeper',
    name: 'Budget Keeper',
    tagline: "Watches the month and says the day you'll go over.",
    category: 'Money',
    runs: 1207,
    installs: 1594,
    addedAt: '2025-07-23',
  },
  {
    id: 'tax-prepper',
    name: 'Tax Prepper',
    tagline: "Gathers the year's documents and tells you what is missing.",
    category: 'Money',
    runs: 611,
    installs: 933,
    addedAt: '2025-10-21',
  },
  {
    id: 'payroll-checker',
    name: 'Payroll Checker',
    tagline: 'Checks the run before it leaves and flags what changed.',
    category: 'Money',
    runs: 432,
    installs: 704,
    addedAt: '2026-02-10',
  },

  /* Health & Wellbeing */
  {
    id: 'training-partner',
    name: 'Training Partner',
    tagline: "Plans the week's training around the days you actually have.",
    category: 'Health & Wellbeing',
    runs: 712,
    installs: 1044,
    addedAt: '2025-03-19',
  },
  {
    id: 'meal-planner',
    name: 'Meal Planner',
    tagline: "Plans the week's meals around what you'll actually cook.",
    category: 'Health & Wellbeing',
    runs: 1386,
    installs: 1791,
    addedAt: '2025-05-01',
  },
  {
    id: 'sleep-coach',
    name: 'Sleep Coach',
    tagline: "Reads the week's sleep and changes one thing at a time.",
    category: 'Health & Wellbeing',
    runs: 894,
    installs: 1247,
    addedAt: '2025-06-17',
  },
  {
    id: 'habit-keeper',
    name: 'Habit Keeper',
    tagline: 'Tracks the streak and tells you the day it broke.',
    category: 'Health & Wellbeing',
    runs: 623,
    installs: 946,
    addedAt: '2025-09-09',
  },
  {
    id: 'appointment-keeper',
    name: 'Appointment Keeper',
    tagline: 'Books the check-ups and remembers the follow-ups.',
    category: 'Health & Wellbeing',
    runs: 471,
    installs: 748,
    addedAt: '2025-12-16',
  },
  {
    id: 'recovery-coach',
    name: 'Recovery Coach',
    tagline: 'Reads the load and says when to take the day off.',
    category: 'Health & Wellbeing',
    runs: 0,
    installs: 58,
    addedAt: '2026-08-04',
  },

  /* Comms */
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    tagline: 'Joins the call, listens, and leaves behind decisions and owners.',
    category: 'Comms',
    runs: 2604,
    installs: 3218,
    addedAt: '2025-01-23',
    duties: [
      'Joins the call on the calendar and listens without speaking.',
      'Writes decisions and owners, not a transcript.',
      'Posts the notes to the channel before people have left.',
      'Carries the open items into the next meeting.',
    ],
    connectors: [
      CONNECTORS['google-calendar'],
      CONNECTORS['google-meet'],
      CONNECTORS.zoom,
      CONNECTORS.slack,
      CONNECTORS.notion,
    ],
    requirements: [
      {
        name: 'Google Calendar',
        why: 'It joins what is on the calendar and nothing else.',
        satisfiedBy: 'connector',
        connector: 'google-calendar',
      },
      {
        name: 'Notion database',
        why: 'Where the notes land and stay searchable.',
        satisfiedBy: 'connector',
        connector: 'notion',
      },
      {
        name: 'RECORDING_NOTICE',
        why: 'The line it says on joining, so the room knows it is there.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Joins two minutes early and leaves when the host does.',
      'Writes owners only for people who spoke to the item.',
      'Keeps no audio once the notes are written.',
    ],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    tagline: 'Resolves the tickets it can and escalates with the context attached.',
    category: 'Comms',
    runs: 3106,
    installs: 3744,
    addedAt: '2025-02-13',
    duties: [
      'Answers the tickets it has seen answered before.',
      'Escalates with the account history already attached.',
      'Says which past answer it reused, every time.',
      'Writes the missing help article after the third identical ticket.',
    ],
    connectors: [CONNECTORS.gmail, CONNECTORS.slack, CONNECTORS.notion, CONNECTORS.discord],
    requirements: [
      {
        name: 'Gmail account',
        why: 'Where the tickets arrive and the replies go out.',
        satisfiedBy: 'connector',
        connector: 'gmail',
      },
      {
        name: 'Notion database',
        why: 'The help centre it answers out of.',
        satisfiedBy: 'connector',
        connector: 'notion',
      },
      {
        name: 'ESCALATION_CHANNEL',
        why: 'The Slack channel a hard ticket lands in.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Answers only from the help centre, never from memory.',
      'Escalates on the second exchange rather than looping.',
      'Signs every reply as an assistant, not as you.',
    ],
  },
  {
    id: 'reply-drafter',
    name: 'Reply Drafter',
    tagline: 'Drafts the replies in your voice and waits for your nod.',
    category: 'Comms',
    runs: 1832,
    installs: 2377,
    addedAt: '2025-03-27',
  },
  {
    id: 'voicemail-triage',
    name: 'Voicemail Triage',
    tagline: 'Listens to what you missed and writes back what matters.',
    category: 'Comms',
    runs: 764,
    installs: 1096,
    addedAt: '2025-06-05',
  },
  {
    id: 'status-reporter',
    name: 'Status Reporter',
    tagline: 'Posts the update the channel keeps asking you for.',
    category: 'Comms',
    runs: 1341,
    installs: 1722,
    addedAt: '2025-07-29',
  },
  {
    id: 'intro-broker',
    name: 'Intro Broker',
    tagline: 'Writes the double opt-in intro and follows it up once.',
    category: 'Comms',
    runs: 502,
    installs: 811,
    addedAt: '2025-10-28',
  },
  {
    id: 'language-bridge',
    name: 'Language Bridge',
    tagline: 'Answers in their language and keeps your tone.',
    category: 'Comms',
    runs: 638,
    installs: 967,
    addedAt: '2026-03-03',
  },

  /* Learning */
  {
    id: 'study-coach',
    name: 'Study Coach',
    tagline: "Turns what you're reading into questions you can't fake.",
    category: 'Learning',
    runs: 486,
    installs: 774,
    addedAt: '2025-04-16',
  },
  {
    id: 'flashcard-maker',
    name: 'Flashcard Maker',
    tagline: 'Turns the chapter into cards and schedules the review.',
    category: 'Learning',
    runs: 1128,
    installs: 1503,
    addedAt: '2025-05-28',
  },
  {
    id: 'language-tutor',
    name: 'Language Tutor',
    tagline: "Twenty minutes a day, in the language you're avoiding.",
    category: 'Learning',
    runs: 1594,
    installs: 2016,
    addedAt: '2025-07-14',
  },
  {
    id: 'code-tutor',
    name: 'Code Tutor',
    tagline: 'Explains an unfamiliar codebase one path at a time.',
    category: 'Learning',
    runs: 872,
    installs: 1218,
    addedAt: '2025-09-23',
  },
  {
    id: 'reading-list',
    name: 'Reading List',
    tagline: 'Keeps the queue honest and summarises what you finished.',
    category: 'Learning',
    runs: 605,
    installs: 918,
    addedAt: '2025-12-22',
  },
  {
    id: 'exam-prepper',
    name: 'Exam Prepper',
    tagline: "Builds the paper you'll sit and marks it honestly.",
    category: 'Learning',
    runs: 388,
    installs: 634,
    addedAt: '2026-04-21',
  },

  /* Security & Privacy */
  {
    id: 'access-auditor',
    name: 'Access Auditor',
    tagline: 'Reviews who can reach what and tells you what to revoke.',
    category: 'Security & Privacy',
    runs: 559,
    installs: 861,
    addedAt: '2025-02-27',
  },
  {
    id: 'secret-scanner',
    name: 'Secret Scanner',
    tagline: 'Scans the repos for keys and tells you which ones are still live.',
    category: 'Security & Privacy',
    runs: 1236,
    installs: 1642,
    addedAt: '2025-04-11',
  },
  {
    id: 'breach-watch',
    name: 'Breach Watch',
    tagline: 'Watches the dumps for your addresses and says what to rotate.',
    category: 'Security & Privacy',
    runs: 918,
    installs: 1287,
    addedAt: '2025-06-19',
  },
  {
    id: 'phishing-checker',
    name: 'Phishing Checker',
    tagline: "Reads the suspicious mail and tells you why it's fake.",
    category: 'Security & Privacy',
    runs: 744,
    installs: 1073,
    addedAt: '2025-08-15',
  },
  {
    id: 'privacy-cleaner',
    name: 'Privacy Cleaner',
    tagline: 'Finds the accounts you forgot and files the deletion requests.',
    category: 'Security & Privacy',
    runs: 466,
    installs: 739,
    addedAt: '2025-11-18',
  },
  {
    id: 'backup-checker',
    name: 'Backup Checker',
    tagline: 'Proves the backup restores, not just that it ran.',
    category: 'Security & Privacy',
    runs: 341,
    installs: 572,
    addedAt: '2026-06-30',
  },

  /* Growth & Marketing */
  {
    id: 'sales-outbound',
    name: 'Sales Outbound',
    tagline: 'Researches prospects and drafts sequences in your voice.',
    category: 'Growth & Marketing',
    runs: 2455,
    installs: 3011,
    addedAt: '2025-01-20',
    duties: [
      'Researches each prospect before it writes a word.',
      'Drafts a sequence in your voice, three touches deep.',
      'Stops the sequence the moment someone replies.',
      'Logs every send and every reply against the account.',
    ],
    connectors: [
      CONNECTORS.gmail,
      CONNECTORS.linkedin,
      CONNECTORS.slack,
      CONNECTORS.notion,
    ],
    requirements: [
      {
        name: 'Gmail account',
        why: 'It sends from your address, not a shared one.',
        satisfiedBy: 'connector',
        connector: 'gmail',
      },
      {
        name: 'LinkedIn profile',
        why: "It reads the prospect's public profile before writing.",
        satisfiedBy: 'connector',
        connector: 'linkedin',
      },
      {
        name: 'DAILY_SEND_LIMIT',
        why: 'How many first touches a day, so the domain stays clean.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Sends on weekdays only, spaced through the morning.',
      'One sequence per prospect; it will not restart a cold one.',
      'Leaves anything it could not research undrafted.',
    ],
  },
  {
    id: 'launch-planner',
    name: 'Launch Planner',
    tagline: 'Sequences the launch and writes every post it needs.',
    category: 'Growth & Marketing',
    runs: 1176,
    installs: 1602,
    addedAt: '2025-02-06',
  },
  {
    id: 'seo-editor',
    name: 'SEO Editor',
    tagline: 'Rewrites the page for the query people actually type.',
    category: 'Growth & Marketing',
    runs: 803,
    installs: 1211,
    addedAt: '2025-03-13',
  },
  {
    id: 'social-scheduler',
    name: 'Social Scheduler',
    tagline: 'Queues the week and holds anything that needs your nod.',
    category: 'Growth & Marketing',
    runs: 1908,
    installs: 2444,
    addedAt: '2025-05-08',
    duties: [
      'Queues the week from one folder of finished posts.',
      'Holds anything that names a customer until you nod.',
      'Posts at the hour each network is actually read.',
      'Reports on Friday what landed and what did not.',
    ],
    connectors: [
      CONNECTORS.linkedin,
      CONNECTORS.x,
      CONNECTORS.instagram,
      CONNECTORS.facebook,
      CONNECTORS.slack,
    ],
    requirements: [
      {
        name: 'LinkedIn profile',
        why: 'It posts as you, not as a page, unless you say otherwise.',
        satisfiedBy: 'connector',
        connector: 'linkedin',
      },
      {
        name: 'X account',
        why: 'Where the short version of each post goes.',
        satisfiedBy: 'connector',
        connector: 'x',
      },
      {
        name: 'POSTING_WINDOW',
        why: 'The hours it is allowed to post inside.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Queues a week ahead and never posts same-day without asking.',
      'One post per network per day, at most.',
      'Stops the whole queue if you reply to its hold.',
    ],
  },
  {
    id: 'ad-copywriter',
    name: 'Ad Copywriter',
    tagline: 'Writes the variants and kills the ones the data says are dead.',
    category: 'Growth & Marketing',
    runs: 1433,
    installs: 1876,
    addedAt: '2025-06-26',
  },
  {
    id: 'landing-page-writer',
    name: 'Landing Page Writer',
    tagline: 'Rewrites the page around the one thing you sell.',
    category: 'Growth & Marketing',
    runs: 1054,
    installs: 1408,
    addedAt: '2025-08-19',
  },
  {
    id: 'lifecycle-emailer',
    name: 'Lifecycle Emailer',
    tagline: 'Writes the onboarding drip and stops sending when they convert.',
    category: 'Growth & Marketing',
    runs: 869,
    installs: 1216,
    addedAt: '2025-10-02',
  },
  {
    id: 'campaign-analyst',
    name: 'Campaign Analyst',
    tagline: 'Reads the campaign and tells you where the money went.',
    category: 'Growth & Marketing',
    runs: 726,
    installs: 1058,
    addedAt: '2026-01-27',
  },
  {
    id: 'community-manager',
    name: 'Community Manager',
    tagline: "Answers in the server and escalates what it can't.",
    category: 'Growth & Marketing',
    runs: 594,
    installs: 887,
    addedAt: '2026-07-14',
  },
  {
    id: 'linkedin-agent',
    name: 'LinkedIn Agent',
    tagline: 'Plans your week of LinkedIn posts and writes paste-ready drafts.',
    category: 'Growth & Marketing',
    runs: 0,
    installs: 12,
    addedAt: '2026-08-26',
    duties: [
      'Plans the week — which day, which angle, what to cut if it gets busy.',
      'Writes paste-ready drafts and strips the AI tells out of them.',
      'Puts the source and the date it read it under every claim.',
      'Flags anything naming a customer or a departure before you post it.',
    ],
    connectors: [CONNECTORS.linkedin],
    requirements: [
      {
        name: 'LinkedIn profile',
        why: 'It reads your posts and their engagement. It never posts.',
        satisfiedBy: 'connector',
        connector: 'linkedin',
      },
      {
        name: 'BRAND_VOICE',
        why: 'Whose voice the posts go out in.',
        satisfiedBy: 'value',
      },
      {
        name: 'APIFY_TOKEN',
        why: 'Reads post bodies and comments. Without it, paste the text in.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Nothing reaches LinkedIn — no posting, commenting or connecting.',
      'A stat it cannot trace to a page it read gets cut, not estimated.',
      'Runs Monday morning and hands you the week in one file.',
    ],
    soul: `# LinkedIn Agent

You are **LinkedIn Agent**. Your job: plan the week of LinkedIn posts and write the drafts your owner can paste.

**How you work**
- **You may look at LinkedIn. You may not write to it.** That line is the whole rule, and it is about *publishing*, not about *reading*.
  - **Yes:** open LinkedIn in your browser, read the feed, read the inbox, open profiles and companies, run searches, follow a post's comments, and gather what you need for a draft or a prospect list. Browsing is research, and research is your job.
  - **No:** post, comment, react, endorse, follow, send a connection request, or send a message — **even when a skill's own steps tell you to.** Several of your LinkedIn skills end in a publish step; skip it. The draft lands in the workspace as a file and your owner pastes it. If you are asked to publish, say in one line that you do not have that job and the draft is ready.
- Signing in is NOT one of the actions above, and refusing it is a misreading of this rule. When a page needs a sign-in you **call the \`clarify\` tool** — do not write "please sign in and I'll wait" as an ordinary reply, because saying you will wait and then ending your turn is not waiting: it stops the task and leaves your owner to prompt you again. \`clarify\` is the only thing that parks you until they answer, and it is what puts the sign-in card on their screen. Name the site, say the browser is the one on their screen, and when they answer carry straight on with the original task. Point them at the email-and-password option rather than the social buttons: the browser starts with no Google session, so a \`Continue with Google\` button opens Google's account-chooser with nothing to choose and renders a blank window. You never type their credentials and never ask for a password in chat. The session persists, so this is a one-off, not a per-run ritual.
- Every claim carries its source. A stat, a benchmark, a competitor number or a customer name gets the URL it came from and the date you read it, on the line beneath it. A figure you cannot trace to a page you actually read gets **deleted, not estimated**.
- You flag rather than assume. Anything naming a customer, a named individual, or somebody's departure goes in a \`## FLAGS\` section at the bottom of the draft with one line on why it needs a human look. Over-flagging is correct here.
- A week is seven decisions, not seven posts. The plan says which day, which angle, and which posts you would cut if the week got busy.
- Before handing anything over, run \`python3 skills/social-media/linkedin-claim-check/check_claims.py <draft>\`. A non-zero exit means you are **not** done: fix the draft and run it again. Never report a draft as ready on a run where that gate failed or was skipped.
- When the research comes back too thin to back a post honestly, say so in one line and ship the week without that post rather than filling it with something plausible.

Voice: plain, specific, allergic to thought-leader filler.
`,
  },
  {
    id: 'outbound-agent',
    name: 'Outbound Agent',
    tagline: 'Reports which cold-email sequences worked, with the denominator.',
    category: 'Growth & Marketing',
    runs: 0,
    installs: 9,
    addedAt: '2026-08-26',
    duties: [
      'Pulls Smartlead, Instantly, HeyReach and five more into one place.',
      'Reports what worked with the denominator on every rate.',
      'Refuses to call a winner between sequences under 50 sends.',
      'Flags any bounce rate over 5% by name, at the top.',
    ],
    connectors: [CONNECTORS['google-sheets']],
    requirements: [
      {
        name: 'OUTREACHMAGIC_AGENT_KEY',
        why: 'Connects your sequencers. Starts with om_agent_.',
        satisfiedBy: 'value',
      },
      {
        name: 'Google Sheets',
        why: 'Where the weekly report lands.',
        satisfiedBy: 'connector',
        connector: 'google-sheets',
      },
      {
        name: 'SERPER_API_KEY',
        why: 'Looks a person or company up when a reply needs context.',
        satisfiedBy: 'value',
      },
    ],
    howItWorks: [
      'Read-only — it never sends, pauses or edits a campaign.',
      'Runs Monday and reports on the week just gone.',
      "Says 'not enough sends to call it' rather than picking a winner.",
    ],
    soul: `# Outbound Agent

You are **Outbound Agent**. Your job: pull the cold-email and LinkedIn-outreach tools into one view and say which sequences actually work.

**How you work**
- Every rate carries its denominator. Write "14 replies from 210 sent", never "6.7% reply rate" — two of thirty and a hundred and forty of two thousand are not the same finding, and a bare percentage hides which one you have.
- You do not compare two sequences when either has fewer than **50 sends**. Under that floor say "not enough sends to call it" and give the raw counts. A winner declared on twelve sends is noise with a label on it.
- A bounce rate over **5%** is flagged by name, every time, at the top of the report. Say which sequence, what the rate is, and that the sending domain needs attention.
- You are read-only. You never send, pause, resume or edit a campaign. You also never run the local write commands: \`pipeline.py sync\`, \`add-lead\`, \`import-profiles\`, \`merge-leads\`, \`update-stage\`, \`connect-platform\`, \`crm-sync sync\`, or \`archive --purge\`. If a report genuinely needs one, stop and ask first.
- Before reporting a single number, confirm \`scripts/pipeline.py\` resolves in the outreachmagic skill directory. If it is missing, stop and say so in one line. A sequence report with no data source behind it is worse than no report.
- Every report ships with a fenced \`json\` block holding the sequences, the comparisons and the flags behind the prose, then passes \`python3 skills/email/outbound-report-check/check_report.py <report>\`. A non-zero exit means you are not done.
- When a week is genuinely quiet, say so in one line and give the counts. Do not pad a report to look busy.

Voice: numerate, plain, comfortable saying the data will not support that.
`,
  },
  /* Growth & Marketing — real pack, installs from agents/ad-creator */
  {
    id: 'ad-creator',
    name: 'Ad Creator',
    tagline: 'Turns a brand into on-brand ad creative and copy. Generates only; it publishes nothing.',
    category: 'Growth & Marketing',
    runs: 0,
    installs: 0,
    addedAt: '2026-08-28',
  },
  /* Business Ops — real pack, installs from agents/startup-kit-agent */
  {
    id: 'startup-kit-agent',
    name: 'Startup Kit',
    tagline: 'Turns an idea into a market read, a deck and projections you can defend.',
    category: 'Business Ops',
    runs: 0,
    installs: 0,
    addedAt: '2026-08-28',
  },
]

/**
 * The agents we actually have.
 *
 * `ENTRIES` is 97 rows of design canvas — names, taglines and display numbers
 * for a shelf that was mocked before the packs existed. Ninety-four of them
 * install a profile that then introduces itself as a composed approximation of
 * its own card, which reads as a broken product rather than a coming-soon one.
 *
 * So the shelf is gated to the ids that have a real distribution pack under
 * `agents/<id>/` in the cloud-computer repo. Add an id here the same commit you
 * add its pack — the two are one change, and an id with no pack behind it is
 * the bug this gate exists to prevent.
 *
 * The other 93 entries stay in the file deliberately: they are the authored
 * copy for agents still to be built, and deleting them would mean writing them
 * again. Gating beats pruning.
 */
export const AVAILABLE_AGENT_IDS: ReadonlySet<string> = new Set([
  'ad-creator',
  'linkedin-agent',
  'startup-kit-agent',
])

/**
 * Every authored entry, available or not.
 *
 * Stays the full 97 so the catalog's own invariants — every shelf filled, the
 * design-spec names present, a detail-carrying agent carrying the whole set —
 * remain assertions about the authored copy rather than about how much of it
 * currently ships.
 */
export const CATALOG: CatalogAgent[] = [...ENTRIES]

/**
 * What the marketplace actually shows: the entries with a pack behind them.
 *
 * This is the list every user-facing surface reads. `CATALOG` is the authored
 * corpus; this is the shelf.
 */
export const AVAILABLE_CATALOG: CatalogAgent[] = ENTRIES.filter(({ id }) =>
  AVAILABLE_AGENT_IDS.has(id),
)
