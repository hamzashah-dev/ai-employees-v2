import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { HermesProfile } from '@/modules/core/services/hermes/types'

/**
 * Mount smoke tests.
 *
 * A typecheck cannot catch a component that throws on first render — a bad hook
 * order, a missing provider, a null deref in a formatter. These render the real
 * tree against a stubbed backend so those fail here rather than in the browser.
 *
 * The socket is stubbed out: this is about the component tree, and the gateway
 * has its own tests.
 */
vi.mock('@/modules/core/hooks/use-hermes', () => ({
  useHermesConnection: () => undefined,
  getHermes: () => ({ gateway: {}, sessions: {} }),
}))

const { App } = await import('./index')

function profile(name: string, overrides: Partial<HermesProfile> = {}): HermesProfile {
  return {
    name,
    path: `/tmp/${name}`,
    is_default: name === 'default',
    model: 'anthropic/claude-sonnet-4.6',
    provider: 'openrouter',
    has_env: true,
    skill_count: 4,
    gateway_running: false,
    description: `${name} description`,
    ...overrides,
  }
}

/** Trimmed from a real `/api/profiles/sessions/sidebar` row. */
const REAL_SESSION_ROW = {
  id: '20260825_180416_fe6ef1',
  source: 'chat',
  started_at: 1787663056.55,
  ended_at: 1787663082.16,
  last_active: 1787663082.16,
  message_count: 4,
  title: null,
  preview: '8 filed, 1 with your note',
  profile: 'ad-creator',
  archived: 0,
  is_active: false,
}

function stubFetch(
  profiles: HermesProfile[],
  options: { failProfiles?: boolean; withSessions?: boolean } = {},
) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)

    if (url.includes('/api/profiles/sessions/sidebar') && options.withSessions) {
      return jsonResponse({
        recents: { sessions: [REAL_SESSION_ROW], total: 1, profile_totals: {} },
        cron: { sessions: [] },
        messaging: { sessions: [], total: 0 },
        errors: [],
      })
    }

    if (url.includes('/api/profiles/sessions/sidebar')) {
      // The real envelope wraps each slice in an object. Stubbing bare arrays
      // here is what let the "recents is not iterable" crash reach the browser
      // with these tests green.
      return jsonResponse({
        recents: { sessions: [], total: 0, profile_totals: {} },
        cron: { sessions: [] },
        messaging: { sessions: [], total: 0 },
        errors: [],
      })
    }
    if (url.includes('/api/profiles')) {
      if (options.failProfiles) {
        return new Response(JSON.stringify({ detail: 'boom' }), { status: 500 })
      }
      return jsonResponse({ profiles })
    }
    if (url.includes('/api/cron/jobs')) return jsonResponse({ jobs: [] })
    if (url.includes('/api/sessions')) return jsonResponse({ sessions: [] })
    return jsonResponse({})
  })
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the default sidebar at the chat home, not the roster', async () => {
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    // `/` is the one route outside an Employees root, so the sidebar is in default mode:
    // the full product nav, with Employees as a row rather than the roster it swaps to.
    // This is what makes the mode swap reachable at all.
    expect(await screen.findByText('Sites')).toBeInTheDocument()
    expect(await screen.findByText('AI Tools')).toBeInTheDocument()
    expect(screen.queryByText('Ad Creator')).not.toBeInTheDocument()
  })

  it('swaps the whole sidebar body to the roster under an Employees route', async () => {
    window.history.pushState({}, '', '/employees')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator'), profile('inbox-manager')]))

    render(<App />)

    expect(await screen.findByText('Ad Creator')).toBeInTheDocument()
    expect(await screen.findByText('Inbox Manager')).toBeInTheDocument()
    // Replaced, not nested — the default nav is gone.
    expect(screen.queryByText('AI Tools')).not.toBeInTheDocument()
  })

  it('renders roster rows against the real session payload', async () => {
    window.history.pushState({}, '', '/employees')
    vi.stubGlobal(
      'fetch',
      stubFetch([profile('ad-creator'), profile('inbox-manager')], { withSessions: true }),
    )

    render(<App />)

    // Exercises buildEntries with real rows — the path that crashed on the
    // object-wrapped slices.
    expect(await screen.findByText('Ad Creator')).toBeInTheDocument()
    expect(await screen.findByText('8 filed, 1 with your note')).toBeInTheDocument()
  })

  it('lands on the Employees dashboard, not a thread', async () => {
    window.history.pushState({}, '', '/employees')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    // D3 gives the Employees destination a dashboard of its own, so it no longer
    // redirects into whichever thread you had open last.
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/employees')
  })

  it('surfaces a roster failure instead of rendering an empty shell', async () => {
    vi.stubGlobal('fetch', stubFetch([], { failProfiles: true }))

    render(<App />)

    // The query retries once, so allow for that before asserting.
    const errors = await screen.findAllByText(/could not|boom/i, undefined, {
      timeout: 5000,
    })
    expect(errors.length).toBeGreaterThan(0)
  })

  it('invites hiring when there are no employees', async () => {
    vi.stubGlobal('fetch', stubFetch([]))

    render(<App />)

    // Both the sidebar and the main pane say so; either is the point.
    const prompts = await screen.findAllByText(/no employees yet|hire/i)
    expect(prompts.length).toBeGreaterThan(0)
  })
})
