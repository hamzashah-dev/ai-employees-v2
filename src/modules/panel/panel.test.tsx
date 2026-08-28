import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { EmployeePanel } from '.'

/**
 * Mount smoke test.
 *
 * The cadence mapping and its round-trip against the routine row are unit
 * tested; this covers what those cannot — that the drawer now has two levels
 * and the header's chevron means the right thing at each, that an existing
 * routine opens on the control that made it and saves the expression that
 * control stands for, and that delete asks first.
 */

const JOB: HermesCronJob = {
  id: 'job-1',
  name: 'Evening wrap-up',
  schedule: { kind: 'cron', expr: '0 18 * * 1-5' },
  enabled: true,
  state: 'scheduled',
  prompt: 'Summarise today’s replies and flag anything still open.',
  next_run_at: null,
  last_run_at: null,
  last_status: null,
}

/**
 * jsdom ships no `ResizeObserver`, and `usePanelResize` observes the row the
 * drawer shares with the thread so a narrowing window shrinks the drawer. Stubbed
 * here rather than in `src/test/setup.ts` because this is the only suite that
 * mounts the resizable drawer.
 */
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  )
})

interface Recorded {
  url: string
  method: string
  body: unknown
}

function stubFetch(jobs: HermesCronJob[]): Recorded[] {
  const recorded: Recorded[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      recorded.push({
        url,
        method: init?.method ?? 'GET',
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      })
      const body = url.includes('/api/cron/jobs')
        ? { jobs }
        : url.includes('/api/profiles')
          ? { profiles: [] }
          : {}
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
  return recorded
}

async function mount(onClose = vi.fn()): Promise<{ onClose: () => void }> {
  await act(async () => {
    render(
      <Providers>
        <EmployeePanel profile="sales-outbound" onClose={onClose} />
      </Providers>,
    )
  })
  return { onClose }
}

/** The store is module-level, so one test's live turn must not leak into the next. */
const REAL_STOP = useChatStore.getState().stop

describe('EmployeePanel', () => {
  // Reset before rather than after: clearing the store while a subscribed tree
  // is still mounted is a state update outside `act`.
  beforeEach(() => useChatStore.setState({ threads: {}, stop: REAL_STOP }))

  afterEach(() => {
    // Not `unstubAllGlobals`: that would take the ResizeObserver stub with it.
    vi.restoreAllMocks()
  })

  it('closes from the root and goes back a level from the editor', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    const { onClose } = await mount()

    // At the root the chevron still leaves the drawer, which is what it always did.
    expect(
      screen.getByRole('button', { name: 'Back to the conversation' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'New routine' }))

    const back = screen.getByRole('button', { name: 'Back to routines' })
    expect(screen.getByRole('button', { name: 'Add routine' })).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()

    await user.click(back)
    expect(
      screen.getByRole('button', { name: 'Back to the conversation' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Routines' })).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('opens an existing routine on the control that made it and saves that cadence', async () => {
    const user = userEvent.setup()
    const recorded = stubFetch([JOB])
    await mount()

    await user.click(await screen.findByRole('button', { name: 'Edit Evening wrap-up' }))

    // Every field carries the routine's real value, not a placeholder.
    expect(screen.getByLabelText('Name')).toHaveValue('Evening wrap-up')
    expect(screen.getByLabelText('Prompt')).toHaveValue(JOB.prompt)
    expect(screen.getByRole('tab', { name: 'Weekdays' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByLabelText('Time')).toHaveValue('18:00')
    expect(screen.getByText('Runs weekdays at 6:00 PM')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save routine' }))

    await waitFor(() => {
      const put = recorded.find((call) => call.method === 'PUT')
      expect(put?.url).toContain('/api/cron/jobs/job-1')
      expect(put?.body).toEqual({
        updates: {
          name: 'Evening wrap-up',
          schedule: '0 18 * * 1-5',
          prompt: JOB.prompt,
        },
      })
    })
  })

  it('refuses to post a routine with nothing to do', async () => {
    const user = userEvent.setup()
    const recorded = stubFetch([])
    await mount()

    await user.click(await screen.findByRole('button', { name: 'Add the first one' }))
    await user.click(screen.getByRole('button', { name: 'Add routine' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Say what this routine should do.',
    )
    expect(recorded.some((call) => call.method === 'POST')).toBe(false)
  })

  it('asks before deleting', async () => {
    const user = userEvent.setup()
    const recorded = stubFetch([JOB])
    await mount()

    await user.click(await screen.findByRole('button', { name: 'Edit Evening wrap-up' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('Delete this routine?')).toBeInTheDocument()
    expect(recorded.some((call) => call.method === 'DELETE')).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Keep' }))
    expect(screen.queryByText('Delete this routine?')).not.toBeInTheDocument()

    // The first click swaps the row for the confirmation; the second lands on
    // the button that replaced it, which is the point of the two steps.
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(
        recorded.find((call) => call.method === 'DELETE')?.url,
      ).toContain('/api/cron/jobs/job-1')
    })
  })

  it('maximizes into the shipped drawer’s own state, with an honest action strip', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    await mount()

    await user.click(screen.getByRole('button', { name: 'Maximize panel' }))

    expect(screen.getByRole('button', { name: 'Restore split view' })).toBeInTheDocument()
    // The drag handle is gone: there is nothing left to divide.
    expect(screen.queryByRole('slider', { name: 'Resize panel' })).not.toBeInTheDocument()

    // Pause is real — `session.interrupt` — but there is no turn to stop, and
    // the reason is in the accessible name because a disabled button never
    // takes focus and its tooltip would never be read.
    expect(
      screen.getByRole('button', {
        name: 'Pause — Sales Outbound isn’t running anything right now',
      }),
    ).toBeDisabled()
    // The other two are disabled because this thread has no `liveUrl` — and
    // their reasons must say exactly that, not deny a live view can exist. The
    // moment one arrives the take-over is real (it is the frame itself), and
    // this strip sits directly under it.
    expect(
      screen.getByRole('button', { name: /^Take over — There is no live view to take over yet/ }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /^Open in new tab — There is no URL/ }),
    ).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Restore split view' }))
    expect(screen.getByRole('slider', { name: 'Resize panel' })).toBeInTheDocument()
  })

  it('pauses a turn that is actually running', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    const stop = vi.fn(async () => {})
    useChatStore.setState({
      stop,
      threads: {
        'sales-outbound': {
          profile: 'sales-outbound',
          messages: [],
          hydrated: true,
          status: 'working',
        },
      },
    })

    await mount()
    await user.click(screen.getByRole('button', { name: 'Maximize panel' }))

    // Live now: a turn is in flight, so there is something to interrupt and the
    // control carries no excuse in its name.
    const pause = screen.getByRole('button', { name: 'Pause' })
    expect(pause).toBeEnabled()

    await user.click(pause)
    expect(stop).toHaveBeenCalledWith('sales-outbound')
  })

  it('expands the live view over the conversation and minimizes it back', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    useChatStore.setState({
      threads: {
        'sales-outbound': {
          profile: 'sales-outbound',
          messages: [],
          hydrated: true,
          status: 'ready',
          liveUrl: 'http://127.0.0.1:6080/vnc.html',
        },
      },
    })

    await mount()

    // One state, two controls: enlarging from the frame is the header's
    // maximize, so the drag handle goes with it and the conversation is covered.
    await user.click(screen.getByRole('button', { name: 'Enlarge the live view' }))

    expect(screen.getByRole('button', { name: 'Restore split view' })).toBeInTheDocument()
    expect(screen.queryByRole('slider', { name: 'Resize panel' })).not.toBeInTheDocument()
    // Still interactive, and still saying what it cannot vouch for.
    expect(screen.getByTitle('Live view of the browser')).toHaveAttribute(
      'src',
      'http://127.0.0.1:6080/vnc.html',
    )
    expect(
      screen.getByRole('link', { name: 'Open the live view in a new tab' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Exit the enlarged live view' }))

    expect(screen.getByRole('button', { name: 'Maximize panel' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Resize panel' })).toBeInTheDocument()
  })
})
