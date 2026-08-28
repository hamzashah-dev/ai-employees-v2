import { describe, expect, it } from 'vitest'
import { composeSoul } from '.'
import { CATALOG } from '../../constants/catalog'
import type { CatalogAgent } from '../../constants/catalog'

const base: CatalogAgent = {
  id: 'inbox-triage',
  name: 'Inbox Triage',
  tagline: 'Sorts the overnight inbox and tells you the three things that need you.',
  category: 'Personal',
  runs: 1,
  installs: 2,
}

describe('composeSoul', () => {
  it('prefers a hand-authored soul verbatim', () => {
    expect(composeSoul({ ...base, soul: '# Mine\nexact text' })).toBe('# Mine\nexact text')
  })

  it('names the agent and quotes the tagline rather than rewriting it', () => {
    const soul = composeSoul(base)
    expect(soul).toContain('# Inbox Triage')
    expect(soul).toContain('You are **Inbox Triage**')
    // Quoted, not paraphrased: the tagline's "you" means the owner, and
    // rewriting it into second person would flip whose inbox it is.
    expect(soul).toContain(`> ${base.tagline}`)
  })

  it('lays out duties and operating rules when the card carries them', () => {
    const soul = composeSoul({
      ...base,
      duties: ['One.', 'Two.', 'Three.', 'Four.'],
      howItWorks: ['Rule one.', 'Rule two.', 'Rule three.'],
    })
    expect(soul).toContain('**What you do**')
    expect(soul).toContain('- Three.')
    expect(soul).toContain('**How you work**')
    expect(soul).toContain('- Rule three.')
  })

  it('still bounds a tagline-only agent', () => {
    const soul = composeSoul(base)
    expect(soul).not.toContain('**What you do**')
    expect(soul).toContain('If you are asked for something outside it')
  })

  /**
   * The scalability claim, asserted rather than assumed: installing ANY catalog
   * entry has to produce an identity that names that agent. This is the test
   * that would have caught the original bug across all ninety-seven entries
   * instead of the one that was noticed by hand.
   */
  it('gives every catalog entry a soul that names it', () => {
    for (const agent of CATALOG) {
      const soul = composeSoul(agent)
      expect(soul.length, agent.id).toBeGreaterThan(80)
      expect(soul, agent.id).toContain(agent.name)
      expect(soul, agent.id).not.toContain('Computer Agent, an intelligent AI assistant')
    }
  })
})
