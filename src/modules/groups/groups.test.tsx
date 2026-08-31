import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'
import type * as HermesRest from '@/modules/core/services/hermes/rest'
import type { HermesProfile } from '@/modules/core/services/hermes/types'
import { sendToGroupRoom } from './services/send-to-room'
import { useGroupStore } from '@/modules/core/stores/group-store'
import type { GroupMessage, GroupMessageAuthor, GroupRoom } from '@/modules/core/types/groups'
import { NewGroupFlow } from './components/new-group-flow'
import { GroupsView } from '.'
import { GroupRoomView } from './usecases/room'

/**
 * Mount smoke tests for the group surfaces.
 *
 * The round engine, the store and the formatters all have their own unit tests.
 * What none of them catches is this file's class of bug: a hook order that breaks
 * when a room is opened, a Radix dialog mounted outside its providers, a header
 * that derefs `members` before the room exists. So these render the real components
 * inside the real `Providers` and drive them by text and role only.
 *
 * Two seams are cut, and only two. `fetchProfiles` is the one network call these
 * views make, and `send-to-room` is the door to the gateway socket — mocking it
 * keeps the composer's submit path real all the way down to the last function
 * before the wire, which is as far as a mount test should reach.
 */

vi.mock('@/modules/core/services/hermes/rest', async (importOriginal) => ({
  ...(await importOriginal<typeof HermesRest>()),
  fetchProfiles: vi.fn(),
}))

vi.mock('./services/send-to-room', () => ({
  mintGroupThreadId: vi.fn(() => 't-test'),
  sendToGroupRoom: vi.fn(),
  stopGroupRoom: vi.fn(),
}))

const fetchProfilesMock = vi.mocked(fetchProfiles)
const sendMock = vi.mocked(sendToGroupRoom)

function profile(name: string, description = ''): HermesProfile {
  return {
    name,
    path: `/tmp/${name}`,
    is_default: false,
    model: null,
    provider: null,
    has_env: true,
    skill_count: 0,
    gateway_running: false,
    description,
  }
}

const member = (name: string): GroupMessageAuthor => ({ kind: 'member', name })
const viewer = (): GroupMessageAuthor => ({ kind: 'user', name: 'You' })

function entry(id: string, from: GroupMessageAuthor, text: string): GroupMessage {
  return { id, at: 1_700_000_000_000, from, text, thread: 'main' }
}

/** A room as the store holds one, runtime fields at rest unless a test says otherwise. */
function room(over: Partial<GroupRoom> = {}): GroupRoom {
  return {
    id: 'r-launch',
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
    createdAt: 1_700_000_000_000,
    ...over,
  }
}

function seed(...rooms: GroupRoom[]): void {
  useGroupStore.setState({
    rooms: Object.fromEntries(rooms.map((entered) => [entered.id, entered])),
  })
}

async function mount(ui: ReactNode, path = '/groups'): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup()

  await act(async () => {
    render(
      <Providers>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/groups" element={ui} />
            <Route path="/groups/:roomId" element={ui} />
          </Routes>
        </MemoryRouter>
      </Providers>,
    )
  })

  return user
}

beforeEach(() => {
  // Rooms are module state twice over — the zustand store and the device storage
  // its subscription writes to — so both are reset, or one test's room is the
  // next one's mystery row.
  useGroupStore.setState({ rooms: {} })
  localStorage.clear()
  vi.clearAllMocks()
  fetchProfilesMock.mockResolvedValue([])
})

describe('groups index', () => {
  it('says a room lives in this browser rather than implying a shared list', async () => {
    await mount(<GroupsView />)

    expect(screen.getByText(/saved in this browser only/i)).toBeInTheDocument()
  })

  it('lists a room with who spoke last', async () => {
    seed(room({ log: [entry('m1', member('grace'), 'Copy is signed off.')] }))
    await mount(<GroupsView />)

    expect(screen.getByText('Launch crew')).toBeInTheDocument()
    expect(screen.getByText('grace: Copy is signed off.')).toBeInTheDocument()
  })
})

describe('new group flow', () => {
  it('picks members, then suggests their names as the room name', async () => {
    fetchProfilesMock.mockResolvedValue([
      profile('ada', 'Interviews, synthesis'),
      profile('grace', 'Layout, states'),
    ])

    const created = vi.fn()
    const user = await mount(<NewGroupFlow onClose={vi.fn()} onCreated={created} />)

    // §1b — the roster's own description rides along, since Hermes really has one.
    expect(await screen.findByText('Interviews, synthesis')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'ada' }))
    await user.click(screen.getByRole('checkbox', { name: 'grace' }))
    expect(screen.getByText('2 of 6 picked')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    // §1c: pre-filled from the members, so Enter alone is a complete answer.
    expect(screen.getByLabelText('Group name')).toHaveValue('ada, grace')

    await user.click(screen.getByRole('button', { name: 'Create group' }))

    expect(created).toHaveBeenCalledTimes(1)
    const id = created.mock.calls[0]?.[0] as string
    expect(useGroupStore.getState().rooms[id]?.members).toEqual(['ada', 'grace'])
  })

  it('will not advance on a room too small to take turns', async () => {
    fetchProfilesMock.mockResolvedValue([profile('ada'), profile('grace')])

    const user = await mount(<NewGroupFlow onClose={vi.fn()} onCreated={vi.fn()} />)

    await user.click(await screen.findByRole('checkbox', { name: 'ada' }))

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})

describe('group room', () => {
  it('names who is in an empty room and what one message will do', async () => {
    seed(room())
    await mount(<GroupRoomView />, '/groups/r-launch')

    expect(screen.getByText('ada, grace')).toBeInTheDocument()
    expect(screen.getByText(/Nothing here yet/)).toBeInTheDocument()
  })

  it('names every speaker in the transcript', async () => {
    seed(
      room({
        log: [
          entry('m1', viewer(), 'Where are we?'),
          entry('m2', member('ada'), 'Copy is signed off.'),
          entry('m3', member('grace'), 'Then I can ship on Friday.'),
        ],
      }),
    )
    await mount(<GroupRoomView />, '/groups/r-launch')

    expect(screen.getByText('ada')).toBeInTheDocument()
    expect(screen.getByText('Copy is signed off.')).toBeInTheDocument()
    expect(screen.getByText('grace')).toBeInTheDocument()
  })

  it('carries a typed message all the way to the send', async () => {
    seed(room())
    const user = await mount(<GroupRoomView />, '/groups/r-launch')

    await user.type(screen.getByRole('textbox'), 'ship it')
    await user.keyboard('{Enter}')

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: 'r-launch', text: 'ship it' }),
    )
  })

  /*
   * §1e: "No round counters, no pass rows: the machinery stays out of sight."
   * An earlier build put a round counter and a Stop button in this header. This
   * is the regression test for that, and it is the reason the rule is testable
   * at all — the machinery is still there, it just has no surface.
   */
  it('keeps the turn machinery out of sight while a room is mid-round', async () => {
    seed(room({ running: true, round: 2, turn: 'grace' }))
    await mount(<GroupRoomView />, '/groups/r-launch')

    expect(screen.getByText('grace is typing…')).toBeInTheDocument()
    expect(screen.queryByText(/round/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument()
  })

  it('offers the members panel off the header', async () => {
    seed(room({ members: ['ada', 'grace', 'hopper'] }))
    const user = await mount(<GroupRoomView />, '/groups/r-launch')

    expect(screen.getByText('3 members')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Group options' }))

    expect(await screen.findByText('Members · 3 of 6')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Add member/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Rename group/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Delete group/ })).toBeInTheDocument()
  })

  it('sends a link to a room this browser does not have back to the index', async () => {
    await mount(<GroupRoomView />, '/groups/r-missing')

    // Rooms are device-local, so a shared URL is a dead link rather than an error.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
