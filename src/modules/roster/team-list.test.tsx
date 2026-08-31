import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { MemoryRouter } from 'react-router-dom'
import { fetchProfiles, fetchSidebarSessions } from '@/modules/core/services/hermes/rest'
import type * as HermesRest from '@/modules/core/services/hermes/rest'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { useGroupStore } from '@/modules/core/stores/group-store'
import type { GroupRoom } from '@/modules/core/types/groups'
import { RosterList } from './components/roster-list'

/**
 * Team is one list (§1g).
 *
 * The rule under test is "Groups sort by recency among the bots; nothing pins them
 * to the top" — which is exactly the kind of thing that looks right in a screenshot
 * of a single fixture and is wrong the moment a room goes quiet. So these assert on
 * *order*, against employees whose activity brackets the room's.
 */

vi.mock('@/modules/core/services/hermes/rest', async (importOriginal) => ({
  ...(await importOriginal<typeof HermesRest>()),
  fetchProfiles: vi.fn(),
  fetchSidebarSessions: vi.fn(),
}))

const fetchProfilesMock = vi.mocked(fetchProfiles)
const fetchSessionsMock = vi.mocked(fetchSidebarSessions)

const HOUR = 3_600_000
const NOW = 1_700_000_000_000

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

/** A sessions payload whose only useful column is the recency stamp. */
const sessions = (rows: { profile: string; at: number }[]) =>
  ({
    recents: rows.map(({ profile: name, at }) => ({
      profile: name,
      preview: `${name} did a thing`,
      last_active: new Date(at).toISOString(),
    })),
    cron: [],
    messaging: [],
  }) as unknown as Awaited<ReturnType<typeof fetchSidebarSessions>>

function room(over: Partial<GroupRoom> = {}): GroupRoom {
  return {
    id: 'r-1',
    name: 'Launch crew',
    members: ['ada', 'grace'],
    log: [],
    watermarks: {},
    sessions: {},
    holds: {},
    stranded: {},
    epoch: 0,
    running: false,
    turn: null,
    round: 0,
    lastExit: null,
    createdAt: NOW - 2 * HOUR,
    ...over,
  }
}

const mount = async () => {
  render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <TooltipProvider>
          <MemoryRouter>
            <RosterList />
          </MemoryRouter>
        </TooltipProvider>
    </QueryClientProvider>,
  )

  // The roster renders a skeleton until the profiles query settles; every
  // assertion below is about the settled list.
  await screen.findAllByRole('link')
}

/** Row order as the accessible name of each link in Team. */
const rowNames = () =>
  screen
    .getAllByRole('link')
    .map((node) => node.textContent ?? '')
    .map((text) => text.trim())

beforeEach(() => {
  useGroupStore.setState({ rooms: {} })
  vi.clearAllMocks()
  fetchProfilesMock.mockResolvedValue([profile('ada'), profile('grace')])
  fetchSessionsMock.mockResolvedValue(
    sessions([
      { profile: 'ada', at: NOW - HOUR },
      { profile: 'grace', at: NOW - 3 * HOUR },
    ]),
  )
})

describe('team list', () => {
  it('interleaves a room among the employees by recency', async () => {
    useGroupStore.setState({ rooms: { 'r-1': room() } })
    await mount()

    // ada 1h ago, room 2h ago, grace 3h ago — the room sits in the middle rather
    // than being pinned above or below the people.
    const names = rowNames()
    expect(names[0]).toContain('ada')
    expect(names[1]).toContain('Launch crew')
    expect(names[2]).toContain('grace')
  })

  it('puts a brand-new room at the top of Team', async () => {
    // §1d: "Row is already in Team, top of the list" before anyone has spoken.
    useGroupStore.setState({ rooms: { 'r-1': room({ createdAt: Date.now() }) } })
    await mount()

    expect(rowNames()[0]).toContain('Launch crew')
  })

  it('counts the members of a room nobody has used', async () => {
    useGroupStore.setState({ rooms: { 'r-1': room() } })
    await mount()

    expect(screen.getByText('2 members · nobody has spoken yet')).toBeInTheDocument()
  })

  it('names the speaker instead of stamping a time while the room is answering', async () => {
    useGroupStore.setState({ rooms: { 'r-1': room({ running: true, turn: 'grace' }) } })
    await mount()

    expect(screen.getByText('grace is typing…')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'grace is replying' })).toBeInTheDocument()
  })

  it('names who is blocked rather than saying someone is', async () => {
    useGroupStore.setState({
      rooms: {
        'r-1': room({
          log: [
            {
              id: 'm1',
              at: NOW - 2 * HOUR,
              from: { kind: 'member', name: 'grace' },
              text: 'Ready to send @user',
              thread: 'main',
            },
          ],
        }),
      },
    })
    await mount()

    expect(screen.getByText('grace needs a yes.')).toBeInTheDocument()
  })
})
