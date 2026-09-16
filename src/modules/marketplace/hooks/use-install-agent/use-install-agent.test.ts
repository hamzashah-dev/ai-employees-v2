import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type FC, type PropsWithChildren } from 'react'
import { useInstallAgent } from '.'
import { AVAILABLE_AGENT_IDS } from '../../constants/catalog'
import type { CatalogAgent } from '../../constants/catalog'

const fetchSystemStatus = vi.fn()
const createManagedDir = vi.fn()
const uploadManagedFile = vi.fn()
const importProfile = vi.fn()
const deleteManagedFile = vi.fn()

vi.mock('@/modules/core/services/hermes/rest', () => ({
  fetchSystemStatus: (...args: unknown[]) => fetchSystemStatus(...args),
  createManagedDir: (...args: unknown[]) => createManagedDir(...args),
  uploadManagedFile: (...args: unknown[]) => uploadManagedFile(...args),
  importProfile: (...args: unknown[]) => importProfile(...args),
  deleteManagedFile: (...args: unknown[]) => deleteManagedFile(...args),
}))

vi.mock('virtual:agent-packs', () => ({
  AGENT_PACKS: [
    {
      id: 'linkedin-agent',
      name: 'linkedin-agent',
      description: 'Plans your week.',
      version: '0.1.0',
      author: 'Vyro AI',
      url: '/agent-packs/linkedin-agent.tar.gz',
      bytes: 6_536,
      updatedAt: '2026-08-31',
      envRequires: [],
    },
  ],
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
 * What these protect: a hire must put the agent's real distribution pack on the
 * Hermes machine, not reconstruct the agent from its marketing copy.
 *
 * And it must do it in three calls. `POST /api/profiles/import` reads the
 * archive off the *backend's* filesystem, which a browser cannot write to
 * directly and a remote VM does not share — so an implementation that skips the
 * upload works only when Hermes happens to be on localhost with a checkout in
 * the right place. The endpoint an earlier version called,
 * `POST /api/profiles/install`, does not exist at all: it answers 405.
 */
describe('useInstallAgent', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['pack'])) }),
    )
    fetchSystemStatus.mockReset().mockResolvedValue({ computer_home: '/root/.computer' })
    createManagedDir.mockReset().mockResolvedValue({ ok: true })
    uploadManagedFile.mockReset().mockResolvedValue({ ok: true })
    deleteManagedFile.mockReset().mockResolvedValue({ ok: true })
    importProfile
      .mockReset()
      .mockResolvedValue({ ok: true, name: 'linkedin-agent', path: '/p', desktop: null })
  })

  it('uploads the pack, then imports it by the path it landed at', async () => {
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const archive = '/root/.computer/cache/employee-packs/linkedin-agent.tar.gz'
    expect(createManagedDir).toHaveBeenCalledWith('/root/.computer/cache/employee-packs')
    expect(uploadManagedFile).toHaveBeenCalledWith(
      archive,
      expect.any(Blob),
      'linkedin-agent.tar.gz',
    )
    // The import must name the uploaded path, not a path in this repo.
    expect(importProfile).toHaveBeenCalledWith({ archive, name: 'linkedin-agent' })
  })

  it('stages under the backend-reported COMPUTER_HOME, not a guessed one', async () => {
    fetchSystemStatus.mockResolvedValue({ computer_home: '/home/agent/.computer' })
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createManagedDir).toHaveBeenCalledWith('/home/agent/.computer/cache/employee-packs')
  })

  it('says why it cannot install when the backend withholds COMPUTER_HOME', async () => {
    // A gated bind omits the key; there is no other endpoint that reports a
    // writable path, so guessing /root/.computer would fail later and opaquely.
    fetchSystemStatus.mockResolvedValue({})
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('COMPUTER_HOME')
    expect(uploadManagedFile).not.toHaveBeenCalled()
  })

  it('clears a delete tombstone first, so re-hiring a fired agent is visible', async () => {
    /*
     * `import_profile` does not call `clear_named_profile_deleted` the way
     * `create_profile` does, so a name that was deleted before stays hidden
     * from every listing however complete the profile on disk is. Without this
     * the import returns ok and the agent never appears.
     */
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [tombstone] = deleteManagedFile.mock.calls[0] as [string]
    expect(tombstone).toBe('/root/.computer/profiles/.deleted/linkedin-agent')
    // And it happens before the upload, not after the import.
    expect(deleteManagedFile.mock.invocationCallOrder[0]).toBeLessThan(
      uploadManagedFile.mock.invocationCallOrder[0] ?? Infinity,
    )
  })

  it('installs anyway when there is no tombstone to clear', async () => {
    // The normal case: a 404 on a file that was never written is not a failure.
    deleteManagedFile.mockRejectedValue(new Error('Not found'))
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(importProfile).toHaveBeenCalled()
  })

  it('deletes the staged archive once the import has read it', async () => {
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(deleteManagedFile).toHaveBeenCalledWith(
      '/root/.computer/cache/employee-packs/linkedin-agent.tar.gz',
    )
  })

  it('surfaces the collision when a profile of that name already exists', async () => {
    importProfile.mockRejectedValue(
      new Error("Profile 'linkedin-agent' already exists at /root/.computer/profiles/linkedin-agent"),
    )
    const { result } = renderHook(() => useInstallAgent(agent()), { wrapper })
    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('already exists')
    // Still cleaned up: a stranded archive would be silently overwritten next time.
    expect(deleteManagedFile).toHaveBeenCalled()
  })

  it('refuses an id with no pack instead of uploading nothing', async () => {
    const { result } = renderHook(() => useInstallAgent(agent({ id: 'no-pack-here' })), {
      wrapper,
    })
    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('no-pack-here')
    expect(importProfile).not.toHaveBeenCalled()
  })

  it('only offers ids that are valid Hermes profile names', () => {
    // The profile is named after the id, so an invalid one is a 400 at hire time.
    for (const id of AVAILABLE_AGENT_IDS) {
      expect(id).toMatch(/^[a-z0-9][a-z0-9_-]{0,63}$/)
    }
  })
})
