import { describe, expect, it } from 'vitest'
import { AVAILABLE_AGENT_IDS, AVAILABLE_CATALOG, CATALOG } from '.'
import { AGENT_CATEGORIES } from '../categories'
import { CONNECTORS } from '../connectors'

/**
 * A hand-authored data file earns invariant tests, not example ones: nothing
 * here has logic to exercise, but every entry is a promise the page and Hermes
 * both rely on.
 *
 * The slug rule is Hermes's own — `computer_cli/profiles.py` validates a
 * profile name against `[a-z0-9][a-z0-9_-]{0,63}` and refuses five reserved
 * names. Install POSTs a profile named after `id`, so an id that fails here is
 * a 400 at hire time rather than a lint nit.
 */
const HERMES_PROFILE_ID = /^[a-z0-9][a-z0-9_-]{0,63}$/
const HERMES_RESERVED = ['computer', 'test', 'tmp', 'root', 'sudo']

/** No shelf may be too thin to fill a grid row. */
const MIN_PER_CATEGORY = 6

/**
 * The nine §6 of the design spec pins as the real catalogue — name, category
 * and tagline, verbatim. These are the design's words, not ours to reword.
 */
const SPEC_AGENTS = [
  [
    'Inbox Triage',
    'Personal',
    'Sorts the overnight inbox and tells you the three things that need you.',
  ],
  [
    'Expense Manager',
    'Money',
    "Pulls receipts, codes them, and flags only what it can't decide.",
  ],
  [
    'Sales Outbound',
    'Growth & Marketing',
    'Researches prospects and drafts sequences in your voice.',
  ],
  [
    'Talent Scout',
    'Business Ops',
    "Screens applicants and drafts intros you'd actually send.",
  ],
  [
    'Chief of Staff',
    'Personal',
    'Holds the week, chases the threads, briefs you each morning.',
  ],
  [
    'Account Manager',
    'Business Ops',
    'Keeps CRM notes true and follows up before you remember to.',
  ],
  ['Shorts Maker', 'Content', 'Pick a look, vertical-ready, parallel render.'],
  ['Script Writer', 'Content', 'Writes production-ready scripts from a one-line brief.'],
  [
    'Customer Support',
    'Comms',
    'Resolves the tickets it can and escalates with the context attached.',
  ],
] as const

describe('CATALOG', () => {
  it('gives every id a name Hermes will accept as a profile', () => {
    for (const agent of CATALOG) {
      expect(agent.id, agent.name).toMatch(HERMES_PROFILE_ID)
      expect(HERMES_RESERVED, agent.name).not.toContain(agent.id)
    }
  })

  it('uses each id once', () => {
    const ids = CATALOG.map((agent) => agent.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('puts every agent in a category the page renders', () => {
    for (const agent of CATALOG) {
      expect(AGENT_CATEGORIES, agent.name).toContain(agent.category)
    }
  })

  it('fills every shelf', () => {
    for (const category of AGENT_CATEGORIES) {
      const shelf = CATALOG.filter((agent) => agent.category === category)
      expect(shelf.length, category).toBeGreaterThanOrEqual(MIN_PER_CATEGORY)
    }
  })

  it('carries the nine agents the design spec names', () => {
    for (const [name, category, tagline] of SPEC_AGENTS) {
      const agent = CATALOG.find((entry) => entry.name === name)
      expect(agent, name).toBeDefined()
      expect(agent?.category, name).toBe(category)
      expect(agent?.tagline, name).toBe(tagline)
    }
  })

  it('gives every agent a date the Newest sort can order on', () => {
    for (const agent of CATALOG) {
      expect(agent.addedAt, agent.name).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(agent.addedAt ?? '')), agent.name).toBe(false)
    }
  })

  it('keeps the counters whole and in a plausible relation', () => {
    for (const agent of CATALOG) {
      expect(Number.isInteger(agent.runs), agent.name).toBe(true)
      expect(Number.isInteger(agent.installs), agent.name).toBe(true)
      expect(agent.runs, agent.name).toBeGreaterThanOrEqual(0)
      expect(agent.installs, agent.name).toBeGreaterThanOrEqual(agent.runs)
    }
  })

  it('gives a detail-carrying agent the whole detail set', () => {
    const detailed = CATALOG.filter((agent) => agent.duties)
    expect(detailed.length).toBeGreaterThanOrEqual(SPEC_AGENTS.length)

    for (const agent of detailed) {
      // Fixed-length tuples: a short one renders a gap on the detail page.
      expect(agent.duties, agent.name).toHaveLength(4)
      expect(agent.howItWorks, agent.name).toHaveLength(3)
      // An agent that asks for nothing renders an empty "Needs from you" block.
      expect(agent.requirements?.length ?? 0, agent.name).toBeGreaterThanOrEqual(1)
    }
  })

  /**
   * Not "every detailed agent has connectors": `competitor-watch` reads public
   * pages and connects to nothing. The invariant is coherence — a requirement
   * satisfied by a connector needs one listed.
   */
  it('lists connectors when, and only when, a requirement needs one', () => {
    for (const agent of CATALOG) {
      const needsConnector = (agent.requirements ?? []).some(
        (requirement) => requirement.satisfiedBy === 'connector',
      )
      if (needsConnector) {
        expect(agent.connectors?.length ?? 0, agent.name).toBeGreaterThan(0)
      }
    }
  })

  it('points every connector requirement at a connector that exists', () => {
    for (const agent of CATALOG) {
      for (const requirement of agent.requirements ?? []) {
        if (requirement.satisfiedBy === 'connector') {
          expect(requirement.connector, requirement.name).toBeDefined()
          expect(Object.keys(CONNECTORS), requirement.name).toContain(
            requirement.connector,
          )
        } else {
          expect(requirement.connector, requirement.name).toBeUndefined()
        }
      }
    }
  })

  it('gates the shelf to ids that exist, so a typo cannot silently shorten it', () => {
    for (const id of AVAILABLE_AGENT_IDS) {
      expect(
        CATALOG.some((agent) => agent.id === id),
        `${id} is in AVAILABLE_AGENT_IDS but has no catalog entry`,
      ).toBe(true)
    }

    expect(AVAILABLE_CATALOG).toHaveLength(AVAILABLE_AGENT_IDS.size)
  })
})
