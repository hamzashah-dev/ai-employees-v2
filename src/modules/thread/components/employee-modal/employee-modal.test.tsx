import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'
import {
  IDENTITY_COLORS,
  IDENTITY_COLOR_NAMES,
} from '@/modules/core/constants/identity'
import type { HermesManagedFile, HermesMcpServer } from '@/modules/core/services/hermes/types'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useIdentityStore } from '@/modules/core/stores/identity-store'
import { ThreadHeader } from '../thread-header'
import { describeConnector, summariseConnectors } from './utils/connector-state'
import { describeEmployeeState } from './utils/employee-state'
import { toWorkspaceFileRows } from './utils/workspace-files'

const PROFILE_PATH = '/home/u/.computer/profiles/sales-outbound'

const SERVERS: HermesMcpServer[] = [
  {
    name: 'github',
    transport: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    command: null,
    auth: 'oauth',
    enabled: true,
  },
  {
    name: 'sqlite',
    transport: 'stdio',
    url: null,
    command: 'uvx',
    args: ['mcp-server-sqlite'],
    auth: null,
    enabled: false,
  },
]

/** `mtime` is epoch seconds, deliberately out of recency order — the server sorts by name. */
const FILES: HermesManagedFile[] = [
  {
    name: 'archive',
    path: `${PROFILE_PATH}/workspace/archive`,
    is_directory: true,
    size: null,
    mtime: 1_700_000_000,
    mime_type: null,
  },
  {
    name: 'prospects.csv',
    path: `${PROFILE_PATH}/workspace/prospects.csv`,
    is_directory: false,
    size: 812,
    mtime: 1_700_090_000,
    mime_type: 'text/csv',
  },
]

interface Recorded {
  url: string
  method: string
  body: unknown
}

function stubFetch(
  options: { servers?: HermesMcpServer[]; files?: HermesManagedFile[] } = {},
): Recorded[] {
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

      let body: unknown = {}
      if (url.includes('/api/mcp/servers')) {
        body = init?.method === 'PUT' ? { ok: true } : { servers: options.servers ?? [] }
      } else if (url.includes('/api/files')) {
        body = {
          path: `${PROFILE_PATH}/workspace`,
          parent: PROFILE_PATH,
          entries: options.files ?? [],
          root: null,
          locked_root: null,
          can_change_path: true,
        }
      } else if (url.includes('/api/profiles')) {
        body = {
          profiles: [
            {
              name: 'sales-outbound',
              path: PROFILE_PATH,
              is_default: false,
              model: 'anthropic/claude-sonnet-4.6',
              provider: 'openrouter',
              has_env: true,
              skill_count: 4,
              gateway_running: false,
              description: '',
            },
          ],
        }
      }

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
  return recorded
}

async function openModal(): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup()
  await act(async () => {
    render(
      <Providers>
        <ThreadHeader
          profile="sales-outbound"
          displayName="Sales Outbound"
          panelOpen={false}
          onTogglePanel={vi.fn()}
        />
      </Providers>,
    )
  })
  await user.click(screen.getByRole('button', { name: 'About Sales Outbound' }))
  return user
}

describe('describeEmployeeState', () => {
  it('never claims a state it cannot see', () => {
    // The store holds the last status for the life of the tab, so a dropped socket must
    // not leave the card insisting the employee is still working.
    expect(describeEmployeeState('working', 'closed')).toEqual({
      label: 'Status unknown',
      tone: 'neutral',
    })
    expect(describeEmployeeState(undefined, 'connecting').label).toBe('Status unknown')
  })

  it('maps every live status to its own tone', () => {
    expect(describeEmployeeState('working', 'open')).toEqual({
      label: 'Working',
      tone: 'success',
    })
    expect(describeEmployeeState('needs-you', 'open').tone).toBe('warning')
    expect(describeEmployeeState('error', 'open').tone).toBe('critical')
    expect(describeEmployeeState('ready', 'open')).toEqual({
      label: 'Ready',
      tone: 'neutral',
    })
  })
})

describe('describeConnector', () => {
  it('shows where an http server is and what an stdio one runs', () => {
    expect(describeConnector(SERVERS[0]!).detail).toBe('https://api.githubcopilot.com/mcp/')
    expect(describeConnector(SERVERS[1]!).detail).toBe('uvx')
  })

  it('reads `auth` as a requirement, never as a sign-in state', () => {
    // `GET /api/mcp/servers` reports how a server authenticates and never whether it has.
    expect(describeConnector(SERVERS[0]!).needsOAuth).toBe(true)
    expect(describeConnector(SERVERS[1]!).needsOAuth).toBe(false)
  })

  it('counts only what the enabled flag actually says', () => {
    expect(summariseConnectors(SERVERS)).toBe('1 of 2 on')
    expect(summariseConnectors([SERVERS[1]!])).toBe('None of 1 on')
    expect(summariseConnectors([])).toBe('')
  })
})

describe('toWorkspaceFileRows', () => {
  it('re-sorts the server’s name order into newest first', () => {
    expect(toWorkspaceFileRows(FILES).map((row) => row.name)).toEqual([
      'prospects.csv',
      'archive',
    ])
  })

  it('reads mtime as epoch seconds, not milliseconds', () => {
    const row = toWorkspaceFileRows([FILES[1]!])[0]
    expect(row?.timeIso).toBe(new Date(1_700_090_000_000).toISOString())
  })

  it('breaks a tie on name so the list never reshuffles between renders', () => {
    const same = (name: string): HermesManagedFile => ({ ...FILES[1]!, name, path: name })
    expect(toWorkspaceFileRows([same('b'), same('a')]).map((r) => r.name)).toEqual(['a', 'b'])
  })
})

describe('EmployeeModal', () => {
  beforeEach(() => {
    localStorage.clear()
    useIdentityStore.setState({ overrides: {} })
    useChatStore.setState({ threads: {}, connection: 'open' })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('opens from the thread header and names what is real in each section', async () => {
    stubFetch({ servers: SERVERS, files: FILES })
    await openModal()

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sales Outbound' })).toBeInTheDocument()

    // Real connector rows, and the amber line for the one Hermes says needs OAuth.
    expect(await screen.findByText('github')).toBeInTheDocument()
    expect(screen.getByText('https://api.githubcopilot.com/mcp/')).toBeInTheDocument()
    expect(screen.getByText('Needs OAuth sign-in')).toBeInTheDocument()
    expect(screen.getByText('1 of 2 on')).toBeInTheDocument()

    // Real workspace listing, newest first.
    expect(await screen.findByText('Files · 2')).toBeInTheDocument()
    expect(screen.getByText('prospects.csv')).toBeInTheDocument()
  })

  it('scopes the files call by path, because /api/files takes no profile', async () => {
    const recorded = stubFetch({ servers: [], files: FILES })
    await openModal()

    await waitFor(() => {
      const call = recorded.find((entry) => entry.url.includes('/api/files'))
      expect(call?.url).toContain(encodeURIComponent(`${PROFILE_PATH}/workspace`))
      expect(call?.url).not.toContain('profile=')
    })
  })

  it('cannot start an OAuth sign-in, and says so instead of pretending', async () => {
    stubFetch({ servers: SERVERS, files: [] })
    await openModal()

    const signIn = await screen.findByRole('button', {
      name: /Sign in to github/,
    })
    expect(signIn).toBeDisabled()
    expect(signIn).toHaveAccessibleName(/only the Hermes dashboard hosts this flow/)
  })

  it('toggles a connector through the real endpoint', async () => {
    const recorded = stubFetch({ servers: SERVERS, files: [] })
    const user = await openModal()

    const row = (await screen.findByText('sqlite')).closest('li')
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Turn on' }))

    await waitFor(() => {
      const put = recorded.find((entry) => entry.method === 'PUT')
      expect(put?.url).toContain('/api/mcp/servers/sqlite/enabled')
      expect(put?.url).toContain('profile=sales-outbound')
      expect(put?.body).toEqual({ enabled: true, profile: 'sales-outbound' })
    })
  })

  it('renames an employee and the header follows on the same commit', async () => {
    stubFetch({ servers: [], files: [] })
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: 'Edit Sales Outbound' }))

    // The rename is a label over the slug, never a rename of the profile — Hermes has no
    // rename endpoint, and the slug is the key of every session row and cron job — so the
    // editor says both where the name is kept and what Hermes still calls this employee.
    expect(screen.getByText(/Saved on this device only/)).toBeInTheDocument()
    expect(screen.getByText('sales-outbound')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Name'), 'Outbound Desk{Enter}')

    expect(screen.getByRole('heading', { name: 'Outbound Desk' })).toBeInTheDocument()
    expect(useIdentityStore.getState().overrides['sales-outbound']?.title).toBe(
      'Outbound Desk',
    )
  })

  it('drops a rename back to the derived name rather than storing an empty one', async () => {
    stubFetch({ servers: [], files: [] })
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: 'Edit Sales Outbound' }))
    await user.type(screen.getByLabelText('Name'), 'Outbound Desk{Enter}')
    await user.click(screen.getByRole('button', { name: 'Edit Outbound Desk' }))
    await user.clear(screen.getByLabelText('Name'))
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Sales Outbound' })).toBeInTheDocument()
    expect(useIdentityStore.getState().overrides['sales-outbound']).toBeUndefined()
  })

  it('keeps a colour choice, and offers no way to invent a twelfth', async () => {
    stubFetch({ servers: [], files: [] })
    const user = await openModal()

    await user.click(screen.getByRole('radio', { name: 'Grape' }))
    expect(screen.getByRole('radio', { name: 'Grape' })).toBeChecked()
    expect(useIdentityStore.getState().overrides['sales-outbound']?.colorIndex).toBe(
      IDENTITY_COLOR_NAMES.indexOf('Grape'),
    )

    /*
     * Every avatar in the tree repaints, not just the modal's own: the thread header's is
     * the same subscribed component, which is the whole point of the store. Queried out of
     * the document rather than through `getAllByRole`, because an open Radix dialog
     * `aria-hidden`s everything behind it — the header's avatar is on screen but out of the
     * accessibility tree.
     */
    const avatars = document.querySelectorAll('[aria-label="sales-outbound avatar"]')
    expect(avatars).toHaveLength(2)
    for (const avatar of avatars) {
      /*
       * Both avatars fall back to the flat `BotGlyph` in jsdom (no WebGL for the modal's 3D
       * hero, none for the roster's baked sprite either), and the glyph paints its body with
       * a gradient. The midpoint stop is the employee's own hue — all that matters here is
       * that both repainted.
       */
      const hue = avatar.querySelector('stop[offset="52%"]')
      expect(hue).toHaveAttribute(
        'stop-color',
        IDENTITY_COLORS[IDENTITY_COLOR_NAMES.indexOf('Grape')],
      )
    }

    expect(screen.getByRole('button', { name: /Add a colour/ })).toBeDisabled()
  })

  it('reaches Reset with the name box still focused, and puts the face back', async () => {
    // The regression this guards: committing the draft on blur used to also leave edit
    // mode, so the tray unmounted on the pointer-down half of the click aimed at Reset and
    // the click landed on nothing.
    stubFetch({ servers: [], files: [] })
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: 'Edit Sales Outbound' }))
    await user.click(screen.getByRole('radio', { name: 'Cloud' }))
    await user.type(screen.getByLabelText('Name'), 'Outbound Desk')
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByRole('heading', { name: 'Sales Outbound' })).toBeInTheDocument()
    expect(useIdentityStore.getState().overrides['sales-outbound']).toBeUndefined()
  })

  it('says the workspace is empty rather than inventing an authored-by list', async () => {
    stubFetch({ servers: [], files: [] })
    await openModal()

    expect(
      await screen.findByText(/Nothing in Sales Outbound’s workspace yet/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/No MCP servers are configured for this employee/),
    ).toBeInTheDocument()
  })
})
