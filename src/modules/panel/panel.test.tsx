import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { ChatMessage } from '@/modules/core/types/chat'
import { EmployeePanel } from '.'

/**
 * Mount smoke test.
 *
 * The cadence mapping and its round-trip against the routine row are unit tested; this
 * covers what those cannot — that the panel states an employee without opening anything,
 * that routines are a dialog rather than a level of the panel itself, that the browser card
 * appears only when there is a session to report and says only what we know about it, and
 * that maximize is still the shipped drawer's own state.
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
 * panel shares with the thread so a narrowing window shrinks the panel. Stubbed
 * here rather than in `src/test/setup.ts` because this is the only suite that
 * mounts the resizable panel.
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

/** A turn carrying browser calls, which is the only thing that docks the browser card. */
function browsingMessage(
  calls: Array<{ id: string; name: string; label: string; status: 'running' | 'done' }>,
): ChatMessage {
  return {
    id: 'm1',
    role: 'employee',
    text: '',
    createdAt: 0,
    thinkingBlocks: [],
    toolCalls: Object.fromEntries(calls.map((call) => [call.id, call])),
    segments: calls.map((call) => ({
      type: 'tool_call' as const,
      id: `s-${call.id}`,
      toolCallId: call.id,
    })),
  }
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

  it('states the employee, its workspace and its routines without opening anything', async () => {
    stubFetch([JOB])
    await mount()

    expect(screen.getByRole('heading', { name: 'Sales Outbound' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Workspace' })).toBeInTheDocument()
    expect(await screen.findByText('Evening wrap-up')).toBeInTheDocument()

    // The slug is named outright, because the name above it is a local label over it.
    expect(screen.getByText('sales-outbound')).toBeInTheDocument()

    // Nothing is browsing, so there is no browser card at all — not an empty one.
    expect(screen.queryByRole('region', { name: 'Browser session' })).not.toBeInTheDocument()
  })

  it('closes from the header', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    const { onClose } = await mount()

    await user.click(screen.getByRole('button', { name: 'Close panel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('opens an existing routine on the control that made it and saves that cadence', async () => {
    const user = userEvent.setup()
    const recorded = stubFetch([JOB])
    await mount()

    await user.click(screen.getByRole('button', { name: 'Manage' }))
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

  it('goes back to the list from the editor without closing the dialog', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    await mount()

    await user.click(screen.getByRole('button', { name: 'Manage' }))
    await user.click(await screen.findByRole('button', { name: 'Edit Evening wrap-up' }))
    expect(screen.getByRole('button', { name: 'Save routine' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to routines' }))
    expect(screen.getByRole('heading', { name: 'Routines', level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save routine' })).not.toBeInTheDocument()
  })

  it('refuses to post a routine with nothing to do', async () => {
    const user = userEvent.setup()
    const recorded = stubFetch([])
    await mount()

    await user.click(screen.getByRole('button', { name: 'Manage' }))
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

    await user.click(screen.getByRole('button', { name: 'Manage' }))
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

  it('maximizes into the shipped drawer’s own state', async () => {
    const user = userEvent.setup()
    stubFetch([JOB])
    await mount()

    await user.click(screen.getByRole('button', { name: 'Maximize panel' }))

    expect(screen.getByRole('button', { name: 'Restore split view' })).toBeInTheDocument()
    // The drag handle is gone: there is nothing left to divide.
    expect(screen.queryByRole('slider', { name: 'Resize panel' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Restore split view' }))
    expect(screen.getByRole('slider', { name: 'Resize panel' })).toBeInTheDocument()
  })

  it('docks the browser session and reports the steps rather than a picture', async () => {
    stubFetch([JOB])
    useChatStore.setState({
      threads: {
        'sales-outbound': {
          profile: 'sales-outbound',
          messages: [
            browsingMessage([
              { id: 't1', name: 'browser_navigate', label: 'Opening ads.google.com', status: 'done' },
              { id: 't2', name: 'browser_click', label: 'Clicking “New campaign”', status: 'running' },
            ]),
          ],
          hydrated: true,
          status: 'working',
        },
      },
    })

    await mount()

    expect(screen.getByRole('region', { name: 'Browser session' })).toBeInTheDocument()
    expect(screen.getByText('Opening ads.google.com')).toBeInTheDocument()
    expect(screen.getByText('Clicking “New campaign”')).toBeInTheDocument()
    // No address, so no claim that anything is being shown.
    expect(screen.getByText('Using a browser — no live view')).toBeInTheDocument()
    expect(screen.queryByTitle('Live view of the browser')).not.toBeInTheDocument()
  })

  it('stops a turn that is actually running', async () => {
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

    // The header says what is happening, and Stop exists only while it is.
    expect(screen.getByText('Sales Outbound is working')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Stop' }))
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
