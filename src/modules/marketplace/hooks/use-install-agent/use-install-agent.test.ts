import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type FC, type PropsWithChildren } from 'react'
import { HIRED_AGENT_MODEL, useInstallAgent } from '.'
import type { CatalogAgent } from '../../constants/catalog'

const createProfile = vi.fn()
const updateProfileSoul = vi.fn()

vi.mock('@/modules/core/services/hermes/rest', () => ({
  createProfile: (...args: unknown[]) => createProfile(...args),
  updateProfileSoul: (...args: unknown[]) => updateProfileSoul(...args),
}))

const wrapper: FC<PropsWithChildren> = ({ children }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { mutations: { retry: false } } }) },
    children,
  )

const agent = (over: Partial<CatalogAgent> = {}): CatalogAgent => ({
  id: 'linkedin-agent',
  name: 'LinkedIn Agent',
  tagline: 'Plans your week.',
  category: 'Growth & Marketing',
  runs: 0,
  installs: 12,
  ...over,
})

/**
 * The bug these cover: a hired agent used to keep the stock Computer Agent
 * SOUL.md, so a "LinkedIn Agent" introduced itself as a general assistant. The
 * install has to write the identity too, and must not turn a soul-write failure
 * into a failed hire — the profile already exists at that point, and a retry
 * would 409 on the name.
 */
describe('useInstallAgent', () => {
  beforeEach(() => {
    createProfile.mockReset().mockResolvedValue({ ok: true })
    updateProfileSoul.mockReset().mockResolvedValue({ ok: true })
  })

  it('writes the soul after creating the profile', async () => {
    const { result } = renderHook(() => useInstallAgent(agent({ soul: '# LinkedIn Agent' })), {
      wrapper,
    })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createProfile).toHaveBeenCalledWith({
      name: 'linkedin-agent',
      description: 'Plans your week.',
      // Without the clone the profile has no config.yaml, so camofox falls back
      // to a random per-session userId and a signed-in browser never persists.
      clone_from_default: true,
      provider: 'openrouter',
      model: 'minimax/minimax-m3',
    })
    expect(updateProfileSoul).toHaveBeenCalledWith('linkedin-agent', '# LinkedIn Agent')
  })

  // Without both provider and model the create writes no model config at all,
  // and the hire silently inherits whatever the root config held at that moment.
  it('pins the model and provider so a hire cannot inherit an unchosen one', async () => {
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const [body] = createProfile.mock.calls[0] as [Record<string, unknown>]
    expect(body.provider).toBe('openrouter')
    expect(body.model).toBe('minimax/minimax-m3')
    expect(HIRED_AGENT_MODEL).toEqual({ provider: 'openrouter', model: 'minimax/minimax-m3' })
  })

  it('composes an identity for an agent with no hand-authored soul', async () => {
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // Ninety-five of the ninety-seven entries have no `soul`. If the write were
    // skipped for them they would all install as "Computer Agent" — the bug.
    expect(updateProfileSoul).toHaveBeenCalledOnce()
    const [, written] = updateProfileSoul.mock.calls[0] as [string, string]
    expect(written).toContain('LinkedIn Agent')
    expect(written).toContain('Plans your week.')
  })

  it('still counts as hired when the soul write fails', async () => {
    updateProfileSoul.mockRejectedValue(new Error('500'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useInstallAgent(agent({ soul: '# X' })), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isError).toBe(false)
  })
})
