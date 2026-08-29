import { describe, expect, it } from 'vitest'
import type { HermesModelOptions } from '@/modules/core/services/hermes/types'
import { countModels, toModelGroups } from './index'

/**
 * The picker's real logic: what is offerable, and what a search matches.
 * Shaped after a live `/api/model/options` payload — providers carry `slug`
 * rather than `id`, and `models` is a flat list of ids.
 */
const OPTIONS: HermesModelOptions = {
  provider: 'openrouter',
  model: 'z-ai/glm-4.7',
  providers: [
    {
      slug: 'openrouter',
      name: 'OpenRouter',
      authenticated: true,
      models: ['z-ai/glm-4.7', 'anthropic/claude-fable-5'],
    },
    {
      slug: 'anthropic',
      name: 'Anthropic',
      authenticated: true,
      models: ['claude-fable-5', 'claude-sonnet-5'],
    },
    {
      slug: 'gemini',
      name: 'Google AI Studio',
      authenticated: false,
      models: ['gemini-3-pro'],
    },
  ],
}

describe('toModelGroups', () => {
  it('groups authenticated providers and drops the rest', () => {
    const groups = toModelGroups(OPTIONS, '')

    expect(groups.map((group) => group.label)).toEqual(['OpenRouter', 'Anthropic'])
    expect(countModels(groups)).toBe(4)
  })

  it('carries the slug, not the display name, as the provider to write', () => {
    const [openrouter] = toModelGroups(OPTIONS, '')

    expect(openrouter?.provider).toBe('openrouter')
    expect(openrouter?.models[0]).toEqual({
      provider: 'openrouter',
      providerLabel: 'OpenRouter',
      model: 'z-ai/glm-4.7',
    })
  })

  it('matches on the provider name so a bare model id is still findable by vendor', () => {
    // Anthropic's own ids have no vendor prefix, so "anthropic" would otherwise
    // find only OpenRouter's prefixed copy and hide the whole Anthropic shelf.
    const groups = toModelGroups(OPTIONS, 'anthropic')

    expect(groups.map((group) => group.label)).toEqual(['OpenRouter', 'Anthropic'])
    expect(countModels(groups)).toBe(3)
  })

  it('matches on the model id, and is case-insensitive', () => {
    expect(countModels(toModelGroups(OPTIONS, 'GLM'))).toBe(1)
  })

  it('drops a provider once nothing under it matches', () => {
    const groups = toModelGroups(OPTIONS, 'sonnet')

    expect(groups.map((group) => group.label)).toEqual(['Anthropic'])
  })

  it('answers empty for a payload that has not arrived', () => {
    expect(toModelGroups(undefined, '')).toEqual([])
    expect(countModels([])).toBe(0)
  })
})
