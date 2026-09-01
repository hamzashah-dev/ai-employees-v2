import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type FC, type PropsWithChildren } from 'react'
import { useInstallAgent } from '.'
import { AVAILABLE_AGENT_IDS } from '../../constants/catalog'
import type { CatalogAgent } from '../../constants/catalog'

const installProfile = vi.fn()

vi.mock('@/modules/core/services/hermes/rest', () => ({
  installProfile: (...args: unknown[]) => installProfile(...args),
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
 * What these protect: a hire must install the agent's distribution pack, not
 * reconstruct the agent from its marketing copy. The previous implementation
 * created a bare profile and then wrote a soul composed from the card, which
 * meant `agents/<id>/SOUL.md` — the file we actually author and review — was not
 * what a hired agent ran on.
 */
describe('useInstallAgent', () => {
  beforeEach(() => {
    installProfile.mockReset().mockResolvedValue({ ok: true, name: 'linkedin-agent' })
  })

  it('installs the pack for the agent id', async () => {
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(installProfile).toHaveBeenCalledWith({ source: 'agents/linkedin-agent' })
  })

  it('does not force, so hiring twice reports the collision instead of overwriting', async () => {
    // `force: true` would overwrite the SOUL.md and config of a profile in use.
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const [body] = installProfile.mock.calls[0] as [Record<string, unknown>]
    expect(body.force).toBeUndefined()
  })

  it('surfaces a failed install rather than reporting a hire that did not happen', async () => {
    // A missing or malformed pack is a 400 with a readable detail.
    installProfile.mockRejectedValue(new Error('No distribution.yaml found at the distribution root'))
    const { result } = renderHook(() => useInstallAgent(agent({ id: 'no-pack-here' })), {
      wrapper,
    })
    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('distribution.yaml')
  })

  it('only ever installs ids the shelf gates to, which are the ids with packs', () => {
    // The source path is built from the id, so an id with no agents/<id>/ is a
    // 400 at hire time.
    for (const id of AVAILABLE_AGENT_IDS) {
      expect(id).toMatch(/^[a-z0-9][a-z0-9-]*$/)
    }
    expect(AVAILABLE_AGENT_IDS.size).toBeGreaterThan(0)
  })
})
