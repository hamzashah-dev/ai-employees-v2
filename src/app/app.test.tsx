import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { EmployeeStatus, ToolCallStatus } from '@/modules/core/types/chat'

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

/**
 * jsdom has no `matchMedia`, and with none `useIsLaptop` is false — which is the
 * one state where the drawer deliberately does NOT open itself (below `laptop`
 * it is a full-screen sheet, and opening it uninvited would take the
 * conversation off the screen mid-turn). So a desktop has to be stated, or the
 * auto-open tests below would pass for the wrong reason.
 */
function stubDesktop(): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  )
}

/**
 * Put one browser tool call on the open turn, the way the store's `tool.start`
 * and `tool.complete` reducers leave it.
 */
function browserTurn(
  profile: string,
  call: { name: string; status: ToolCallStatus },
  status: EmployeeStatus = 'working',
): void {
  act(() => {
    useChatStore.setState({
      threads: {
        [profile]: {
          profile,
          hydrated: true,
          status,
          messages: [
            {
              id: 'm1',
              role: 'assistant',
              text: '',
              createdAt: 0,
              thinkingBlocks: [],
              segments: [],
              toolCalls: { t1: { id: 't1', name: call.name, status: call.status } },
            },
          ],
        },
      },
    } as never)
  })
}

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    localStorage.clear()
    useChatStore.setState({ threads: {} } as never)
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

  it('lands on the catalogue, not a thread', async () => {
    window.history.pushState({}, '', '/employees')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    // Employees *is* the catalogue: the sidebar already lists the team, so the page
    // behind the destination is the one thing you come here to do — hire. It does not
    // redirect into whichever thread you had open last either.
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Agent Marketplace' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/employees')
  })

  it('opens one agent’s detail over the catalogue at the hire route', async () => {
    window.history.pushState({}, '', '/employees/hire/inbox-triage')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    // Both render: the panel is a portalled Dialog sitting over a dimmed grid, which is
    // why the route mounts the catalogue underneath it rather than replacing it.
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    /*
     * Queried out of the document rather than by role: an open Radix dialog `aria-hidden`s
     * everything behind it, so the catalogue is on screen but out of the accessibility
     * tree. That is the correct behaviour, and it is exactly what proves the two are
     * layered rather than one having replaced the other.
     */
    expect(document.querySelector('h1')).toHaveTextContent('Agent Marketplace')
  })

  it('answers an unknown agent key rather than falling through to the catch-all', async () => {
    window.history.pushState({}, '', '/employees/hire/not-a-real-agent')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    expect(await screen.findByText('No such agent')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/employees/hire/not-a-real-agent')
  })

  it('keeps `hire` from being read as a profile slug', async () => {
    // `/employees/:profile` would happily match `hire` and open a thread for a profile
    // that does not exist. The three-segment hire route is what stops it.
    window.history.pushState({}, '', '/employees/hire/inbox-triage')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    await screen.findByRole('dialog')
    // The thread's own header would name the employee; the catalogue has no such heading.
    expect(screen.queryByRole('button', { name: /About hire/ })).not.toBeInTheDocument()
  })

  it('has no /marketplace route left', async () => {
    window.history.pushState({}, '', '/marketplace')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)

    // Falls through to the catch-all like any other unknown path.
    await screen.findByText('Sites')
    expect(window.location.pathname).toBe('/')
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
  /**
   * The drawer is where the live browser and the login ask live, so the agent
   * reaching for a browser has to bring it on screen by itself — the founder
   * should not have to know to open a panel to answer a sign-in.
   */
  it('opens the drawer by itself when the agent starts browsing', async () => {
    stubDesktop()
    window.history.pushState({}, '', '/employees/ad-creator')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)
    await screen.findByRole('button', { name: /open panel|details/i }).catch(() => null)
    expect(screen.queryByRole('complementary', { name: /details/i })).not.toBeInTheDocument()

    browserTurn('ad-creator', { name: 'browser_navigate', status: 'running' })

    expect(
      await screen.findByRole('complementary', { name: /details/i }),
    ).toBeInTheDocument()
  })

  /**
   * And having brought it up uninvited, it must lose the argument when the user
   * closes it.
   *
   * The shape here is the one that matters and the one a naive latch fails:
   * the first call COMPLETES before the next starts. "Find me clients on
   * LinkedIn" is dozens of such calls, and a latch re-armed on the gap between
   * them re-opens the drawer dozens of times over the user closing it.
   */
  it('stays closed for the rest of the turn once the user closes it', async () => {
    stubDesktop()
    window.history.pushState({}, '', '/employees/ad-creator')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)
    browserTurn('ad-creator', { name: 'browser_navigate', status: 'running' })

    const panel = await screen.findByRole('complementary', { name: /details/i })
    expect(panel).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close panel' }))
    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: /details/i })).not.toBeInTheDocument(),
    )

    // The gap: that call is done, the turn is not over.
    browserTurn('ad-creator', { name: 'browser_navigate', status: 'done' })
    // ...and the agent reaches for the browser again.
    browserTurn('ad-creator', { name: 'browser_click', status: 'running' })

    await waitFor(() => {})
    expect(screen.queryByRole('complementary', { name: /details/i })).not.toBeInTheDocument()
  })

  /** The next task is a fresh argument, though. */
  it('opens itself again on the next turn', async () => {
    stubDesktop()
    window.history.pushState({}, '', '/employees/ad-creator')
    vi.stubGlobal('fetch', stubFetch([profile('ad-creator')]))

    render(<App />)
    browserTurn('ad-creator', { name: 'browser_navigate', status: 'running' })
    await screen.findByRole('complementary', { name: /details/i })
    await userEvent.click(screen.getByRole('button', { name: 'Close panel' }))
    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: /details/i })).not.toBeInTheDocument(),
    )

    // Turn ends -> the latch re-arms.
    browserTurn('ad-creator', { name: 'browser_navigate', status: 'done' }, 'ready')
    browserTurn('ad-creator', { name: 'browser_navigate', status: 'running' })

    expect(
      await screen.findByRole('complementary', { name: /details/i }),
    ).toBeInTheDocument()
  })
})
