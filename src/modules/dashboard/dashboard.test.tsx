import { describe, expect, it, afterEach, beforeEach, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { ACCOUNT_NAME } from '@/modules/core/constants/account'
import { DashboardView } from '.'

/**
 * Mount smoke test.
 *
 * The bucketing has its own unit test; this covers what that cannot — that the
 * tree renders at all, and that a section with nothing in it disappears instead
 * of leaving a heading over empty space.
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
    description: `${name} description`,
  }
}

function stubFetch(profiles: HermesProfile[]) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    const body = url.includes('/api/profiles/sessions/sidebar')
      ? {
          recents: { sessions: [], total: 0, profile_totals: {} },
          cron: { sessions: [] },
          messaging: { sessions: [], total: 0 },
          errors: [],
        }
      : url.includes('/api/profiles')
        ? { profiles }
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
          <DashboardView />
        </MemoryRouter>
      </Providers>,
    )
  })
}

describe('DashboardView', () => {
  // Reset before rather than after: clearing the store while a subscribed tree
  // is still mounted is a state update outside `act`.
  beforeEach(() => useChatStore.setState({ threads: {} }))

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('greets the account and lists the team, collapsing the sections with nothing in them', async () => {
    vi.stubGlobal('fetch', stubFetch([profile('inbox-manager'), profile('sales-outbound')]))
    await mount()

    expect(await screen.findByText('Inbox Manager')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(ACCOUNT_NAME)
    expect(screen.getByRole('heading', { name: 'Your team' })).toBeInTheDocument()
    expect(screen.getAllByText('Ready')).toHaveLength(2)

    // No live threads and no sessions today, so three of the five sections have
    // nothing to say and must not render their headings.
    expect(screen.queryByText('Needs a yes')).not.toBeInTheDocument()
    expect(screen.queryByText('Working now')).not.toBeInTheDocument()
    expect(screen.queryByText('Finished today')).not.toBeInTheDocument()
  })

  it('answers an empty roster with D5 rather than a bare greeting', async () => {
    vi.stubGlobal('fetch', stubFetch([]))
    await mount()

    expect(
      await screen.findByRole('heading', { name: 'Your team is empty' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse the Marketplace' })).toHaveAttribute(
      'href',
      '/marketplace',
    )

    // Three real §6 agents, each landing on its own detail page.
    expect(screen.getByRole('link', { name: 'Hire Ad Creator' })).toHaveAttribute(
      'href',
      '/marketplace/ad-creator',
    )
    expect(screen.getByRole('link', { name: 'Hire LinkedIn Agent' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hire Startup Kit' })).toBeInTheDocument()

    // The counting line would only say the same thing again.
    expect(
      screen.queryByText('No employees yet — hire your first from the Marketplace.'),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Your team' })).not.toBeInTheDocument()
  })

  it('shows a live turn and an approval from the socket state', async () => {
    vi.stubGlobal('fetch', stubFetch([profile('inbox-manager'), profile('expense-manager')]))
    useChatStore.setState({
      threads: {
        'inbox-manager': {
          profile: 'inbox-manager',
          messages: [],
          hydrated: true,
          status: 'working',
          statusText: 'Researching 14 prospects from your sheet',
          workingSince: Date.now() - 761_000,
        },
        'expense-manager': {
          profile: 'expense-manager',
          messages: [],
          hydrated: true,
          status: 'needs-you',
          approval: {
            id: 'a1',
            summary: 'Travel or Meals? One receipt I can’t code.',
            detail: '$214.00 · BLUEBOTTLE*SF · Aug 24',
          },
        },
      },
    })

    await mount()

    expect(
      await screen.findByText('Researching 14 prospects from your sheet'),
    ).toBeInTheDocument()
    expect(screen.getByText('00:12:41')).toBeInTheDocument()
    expect(screen.getByText('Travel or Meals? One receipt I can’t code.')).toBeInTheDocument()
    expect(screen.getByText('$214.00 · BLUEBOTTLE*SF · Aug 24')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open thread' })).toHaveAttribute(
      'href',
      '/employees/expense-manager',
    )
  })
})
