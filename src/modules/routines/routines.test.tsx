import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Providers } from '@/app/providers'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { RoutinesView } from '.'

/**
 * Mount smoke test.
 *
 * The two formatters have their own unit tests; this covers what they cannot —
 * that one `profile=all` call feeds the whole table, and that the three states
 * the design calls out (a failed last run, a paused row, an empty roster) come
 * out of real record fields rather than being drawn.
 */

const HOUR = 3_600_000

function job(over: Partial<HermesCronJob> & { id: string }): HermesCronJob {
  return {
    name: over.id,
    schedule: { kind: 'cron', expr: '0 8 * * *' },
    enabled: true,
    state: 'scheduled',
    last_run_at: new Date(Date.now() - 2 * HOUR).toISOString(),
    next_run_at: new Date(Date.now() + 2 * HOUR).toISOString(),
    last_status: 'success',
    profile: 'inbox-manager',
    ...over,
  }
}

function stubFetch(jobs: HermesCronJob[]) {
  const calls: string[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    calls.push(String(input))
    return new Response(JSON.stringify({ jobs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return calls
}

async function mount(): Promise<void> {
  await act(async () => {
    render(
      <Providers>
        <MemoryRouter>
          <RoutinesView />
        </MemoryRouter>
      </Providers>,
    )
  })
}

describe('RoutinesView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists every employee’s routines from one call, with the cadence the drawer shows', async () => {
    const calls = stubFetch([
      job({ id: 'morning-brief', name: 'Morning brief' }),
      job({
        id: 'weekly-digest',
        name: 'Weekly digest',
        schedule: { kind: 'cron', expr: '0 18 * * 1-5' },
        profile: 'sales-outbound',
      }),
    ])

    await mount()

    expect(await screen.findByText('Morning brief')).toBeInTheDocument()
    expect(screen.getByText('Weekly digest')).toBeInTheDocument()
    expect(screen.getByText('Inbox Manager')).toBeInTheDocument()
    expect(screen.getByText('Sales Outbound')).toBeInTheDocument()

    // The same phrasing the panel's routine row uses, not the raw expression.
    expect(screen.getByText('Every day at 8:00 AM')).toBeInTheDocument()
    expect(screen.getByText('Weekdays at 6:00 PM')).toBeInTheDocument()
    expect(screen.getAllByText('2 hours ago')).toHaveLength(2)

    // One request, whatever the roster size.
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('profile=all')
  })

  it('reads failed and paused off the record rather than decorating a row', async () => {
    stubFetch([
      job({ id: 'reconcile', name: 'Reconcile receipts', last_status: 'error' }),
      job({ id: 'nightly', name: 'Nightly sweep', enabled: false, state: 'paused' }),
    ])

    await mount()

    expect(await screen.findByText('Failed')).toBeInTheDocument()
    // Twice over: the status pill, and the next-run cell — a paused routine has
    // no next run to promise, so it says so rather than printing a stale one.
    expect(screen.getAllByText('Paused')).toHaveLength(2)
    // Only the still-scheduled row keeps its next run.
    expect(screen.getAllByText('in 2 hours')).toHaveLength(1)
  })

  it('says the roster runs nothing rather than showing an empty table', async () => {
    stubFetch([])
    await mount()

    expect(
      await screen.findByRole('heading', { name: 'No routines yet' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('offers a retry instead of an empty table when the call fails', async () => {
    vi.stubGlobal(
      'fetch',
      // 404 rather than 500: the query client retries a 500 once, and this
      // test is about the error state, not about the retry policy.
      vi.fn(async () => new Response('nope', { status: 404 })),
    )
    await mount()

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
