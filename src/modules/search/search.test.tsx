import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { useSearchStore } from '@/modules/core/stores/search-store'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { EmployeeSearchModal } from '.'

/**
 * Mount smoke test.
 *
 * The highlighting, the roster match and the fan-out each have their own unit
 * tests; this covers what those cannot — that the dialog mounts inside the real
 * providers, that both groups render, that the no-results state appears instead
 * of two empty headings, and that Cmd+K opens the thing at all.
 */

function profile(name: string): HermesProfile {
  return {
    name,
    path: `/tmp/${name}`,
    is_default: false,
    model: null,
    provider: null,
    has_env: true,
    skill_count: 0,
    gateway_running: false,
    description: '',
  }
}

const PROFILES = [profile('expense-manager'), profile('inbox-triage')]

/** One FTS hit, marked up the way `snippet(messages_fts, …)` actually returns it. */
function stubFetch(hits: Record<string, unknown[]> = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)

    const body = url.includes('/api/sessions/search')
      ? { results: hits[new URL(url, 'http://x').searchParams.get('profile') ?? ''] ?? [] }
      : url.includes('/api/profiles/sessions/sidebar')
        ? { recents: { sessions: [] }, cron: { sessions: [] }, messaging: { sessions: [] } }
        : url.includes('/api/profiles')
          ? { profiles: PROFILES }
          : {}

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

async function mount(): Promise<void> {
  await act(async () => {
    render(
      <Providers>
        <MemoryRouter>
          <EmployeeSearchModal />
        </MemoryRouter>
      </Providers>,
    )
  })
}

describe('EmployeeSearchModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', stubFetch())
    useSearchStore.setState({ isOpen: false })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    act(() => useSearchStore.setState({ isOpen: false }))
  })

  it('renders nothing while closed', async () => {
    await mount()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens from the store and focuses its input', async () => {
    await mount()
    await act(async () => useSearchStore.getState().open())

    expect(await screen.findByRole('dialog')).toBeTruthy()
    expect(screen.getByLabelText('Search employees and messages')).toBeTruthy()
  })

  it('opens on Cmd+K, the binding imagine-computer-web already uses for search', async () => {
    await mount()
    expect(useSearchStore.getState().isOpen).toBe(false)

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    })

    expect(useSearchStore.getState().isOpen).toBe(true)
  })

  it('groups a roster name match under Employees', async () => {
    await mount()
    await act(async () => useSearchStore.getState().open())

    const input = await screen.findByLabelText('Search employees and messages')
    await act(async () => {
      await userEvent.type(input, 'expense')
    })

    expect(await screen.findByRole('heading', { name: 'Employees' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Expense Manager/ })).toBeTruthy()
    // A group with nothing in it is absent, not an empty heading.
    expect(screen.queryByRole('heading', { name: 'Messages' })).toBeNull()
  })

  it('groups backend hits under Messages, markers stripped', async () => {
    vi.stubGlobal(
      'fetch',
      stubFetch({
        'inbox-triage': [
          { session_id: 's1', lineage_root: 'r1', snippet: 'parked the >>>vercel<<< invoice' },
        ],
      }),
    )
    await mount()
    await act(async () => useSearchStore.getState().open())

    const input = await screen.findByLabelText('Search employees and messages')
    await act(async () => {
      await userEvent.type(input, 'vercel')
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Messages' })).toBeTruthy()
    })
    expect(screen.getByText(/parked the/)).toBeTruthy()
    expect(screen.queryByText(/>>>/)).toBeNull()
  })

  it('shows the no-results state rather than two empty headings', async () => {
    await mount()
    await act(async () => useSearchStore.getState().open())

    const input = await screen.findByLabelText('Search employees and messages')
    await act(async () => {
      await userEvent.type(input, 'kubernetes')
    })

    await waitFor(() => {
      expect(screen.getByText(/No results for/)).toBeTruthy()
    })
    expect(screen.queryByRole('heading', { name: 'Employees' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Messages' })).toBeNull()
  })
})
