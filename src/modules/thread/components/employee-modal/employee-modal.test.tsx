import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'
import {
  IDENTITY_COLORS,
  IDENTITY_COLOR_NAMES,
} from '@/modules/core/constants/identity'
import type {
  HermesEnvResponse,
  HermesManagedFile,
  HermesMcpServer,
} from '@/modules/core/services/hermes/types'
import type { ProfileEnv } from '@/modules/core/services/hermes/rest'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useIdentityStore } from '@/modules/core/stores/identity-store'
import { ThreadHeader } from '../thread-header'
import { describeConnector, summariseConnectors } from './utils/connector-state'
import { describeEmployeeState } from './utils/employee-state'
import { isValidKeyName, toVaultKeys } from './utils/vault-keys'
import { describeFileKind, formatFileSize } from './utils/file-kind'
import { toWorkspaceFileRows } from './utils/workspace-files'
import {
  buildBreadcrumbs,
  isWithinWorkspace,
  parentWithinWorkspace,
} from './utils/workspace-path'

const PROFILE_PATH = '/home/u/.computer/profiles/sales-outbound'

const SERVERS: HermesMcpServer[] = [
  {
    name: 'github',
    transport: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    command: null,
    auth: 'oauth',
    enabled: true,
    tools: ['create_issue', 'list_prs'],
  },
  {
    name: 'sqlite',
    transport: 'stdio',
    url: null,
    command: 'uvx',
    args: ['mcp-server-sqlite'],
    auth: null,
    enabled: false,
    tools: ['query'],
  },
]

const WORKSPACE = `${PROFILE_PATH}/workspace`

/** `mtime` is epoch seconds, deliberately out of recency order — the server sorts by name. */
const FILES: HermesManagedFile[] = [
  {
    name: 'archive',
    path: `${WORKSPACE}/archive`,
    is_directory: true,
    size: null,
    mtime: 1_700_000_000,
    mime_type: null,
  },
  {
    name: 'prospects.csv',
    path: `${WORKSPACE}/prospects.csv`,
    is_directory: false,
    size: 812,
    mtime: 1_700_090_000,
    mime_type: 'text/csv',
  },
]

/**
 * What `archive/` holds. The `.md` deliberately carries `application/octet-stream`, because
 * that is what the real backend answers for markdown — the viewer has to key off the
 * extension or it would refuse to render the workspace's most common file.
 */
const ARCHIVE: HermesManagedFile[] = [
  {
    name: 'q3-notes.md',
    path: `${WORKSPACE}/archive/q3-notes.md`,
    is_directory: false,
    size: 64,
    mtime: 1_700_100_000,
    mime_type: 'application/octet-stream',
  },
  {
    name: 'model.xlsx',
    path: `${WORKSPACE}/archive/model.xlsx`,
    is_directory: false,
    size: 13_645,
    mtime: 1_700_095_000,
    mime_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
]

const ARCHIVE_MARKDOWN = '# Q3 notes\n\nPipeline held.'

/** Every directory the file stub knows about, by the absolute path `/api/files` is given. */
const TREE: Record<string, HermesManagedFile[]> = {
  [WORKSPACE]: FILES,
  [`${WORKSPACE}/archive`]: ARCHIVE,
}

/**
 * `GET /api/env` answers the whole catalogue, not the profile's `.env` — 295 rows against 2
 * set on a real install. The fixture keeps that shape, because the filter on `is_set` is the
 * only thing standing between the Vaults page and a claim that the employee holds every
 * service Hermes has ever heard of.
 */
const ENV: HermesEnvResponse = {
  OPENROUTER_API_KEY: {
    is_set: true,
    redacted_value: 'k-or...8e34',
    is_password: true,
    category: 'provider',
    provider_label: 'OpenRouter',
    tools: [],
  },
  FAL_KEY: {
    is_set: true,
    redacted_value: 'd9ce...2767',
    is_password: true,
    category: 'tool',
    tools: ['image_generate'],
  },
  ANTHROPIC_API_KEY: { is_set: false, is_password: true, category: 'provider' },
  TELEGRAM_BOT_TOKEN: {
    is_set: true,
    redacted_value: 'tg...9021',
    is_password: true,
    category: 'messaging',
    channel_managed: true,
  },
}

/**
 * The same narrowing `fetchProfileEnv` applies, so the unit tests below exercise
 * `toVaultKeys` against the shape it is really handed rather than a hand-built one.
 */
function fromWire(rows: HermesEnvResponse): ProfileEnv {
  return Object.fromEntries(
    Object.entries(rows).map(([name, row]) => [
      name,
      {
        isSet: row.is_set === true,
        isPassword: row.is_password === true,
        redactedValue: row.redacted_value ?? null,
        description: row.description ?? '',
        category: row.category ?? '',
        providerLabel: row.provider_label ?? '',
        tools: row.tools ?? [],
        channelManaged: row.channel_managed === true,
        custom: row.custom === true,
      },
    ]),
  )
}

interface Recorded {
  url: string
  method: string
  body: unknown
}

function stubFetch(
  options: {
    servers?: HermesMcpServer[]
    files?: HermesManagedFile[]
    /** Directory path → entries, for the tests that walk into a subfolder. */
    tree?: Record<string, HermesManagedFile[]>
    env?: HermesEnvResponse
  } = {},
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
      if (url.includes('/api/env/reveal')) {
        body = { key: 'OPENROUTER_API_KEY', value: 'sk-or-v1-the-real-thing' }
      } else if (url.includes('/api/env')) {
        body = options.env ?? {}
      } else if (url.includes('/api/model/options')) {
        body = {
          provider: 'openrouter',
          model: 'anthropic/claude-sonnet-4.6',
          providers: [
            {
              slug: 'openrouter',
              name: 'OpenRouter',
              authenticated: true,
              models: ['anthropic/claude-sonnet-4.6', 'z-ai/glm-4.7'],
            },
            {
              slug: 'gemini',
              name: 'Google AI Studio',
              authenticated: false,
              models: ['gemini-3-pro'],
            },
          ],
        }
      } else if (url.includes('/model') && init?.method === 'PUT') {
        body = { ok: true, provider: 'openrouter', model: 'z-ai/glm-4.7' }
      } else if (url.includes('/api/mcp/servers')) {
        body = init?.method === 'PUT' ? { ok: true } : { servers: options.servers ?? [] }
      } else if (url.includes('/api/files/download')) {
        // The bytes route, not a JSON one — the viewer reads it as a blob.
        return new Response(ARCHIVE_MARKDOWN, {
          status: 200,
          headers: { 'Content-Type': 'text/markdown' },
        })
      } else if (url.includes('/api/files')) {
        const asked = decodeURIComponent(url.split('path=')[1] ?? '')
        body = {
          path: asked,
          parent: PROFILE_PATH,
          entries: options.tree?.[asked] ?? options.files ?? [],
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

/** The card opens on Info; every other page is one rail click away. */
async function openPage(
  user: ReturnType<typeof userEvent.setup>,
  page: 'Info' | 'Files' | 'Connectors' | 'Vaults',
): Promise<void> {
  await user.click(screen.getByRole('button', { name: page }))
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
  it('says how a server connects and how much it brings, not where it lives', () => {
    // A URL or a `uvx` line is truncated to uselessness in a 720px card; the transport and
    // the tool count both fit and are what you need to decide whether to leave it on.
    expect(describeConnector(SERVERS[0]!).detail).toBe('HTTP · 2 tools')
    expect(describeConnector(SERVERS[1]!).detail).toBe('stdio · 1 tool')
  })

  it('falls back to the transport alone rather than claiming zero tools', () => {
    // A server Hermes has never started reports none. "0 tools" would read as broken.
    const unqueried = { ...SERVERS[0]!, tools: null }
    expect(describeConnector(unqueried).detail).toBe('HTTP')
  })

  it('reads `auth` as a requirement, never as a sign-in state', () => {
    // `GET /api/mcp/servers` reports how a server authenticates and never whether it has,
    // and the line is suppressed once the server is on — at that point it would be nagging
    // about something we cannot tell whether the user has already dealt with.
    expect(describeConnector({ ...SERVERS[0]!, enabled: false }).needsOAuth).toBe(true)
    expect(describeConnector(SERVERS[0]!).needsOAuth).toBe(false)
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

describe('describeFileKind', () => {
  it('reads the extension, not the payload’s mime type', () => {
    // The listing calls markdown `application/octet-stream` on a real install, so a viewer
    // keyed on mime_type would refuse the workspace's most common file.
    expect(describeFileKind('q3-notes.md').kind).toBe('markdown')
    expect(describeFileKind('README.MD').kind).toBe('markdown')
    expect(describeFileKind('shot.PNG').kind).toBe('image')
    expect(describeFileKind('clip.webm').kind).toBe('video')
    expect(describeFileKind('brief.pdf').kind).toBe('pdf')
    expect(describeFileKind('create_projections.py').kind).toBe('text')
    expect(describeFileKind('metrics.csv').kind).toBe('text')
  })

  it('names the missing renderer for every kind it cannot show', () => {
    for (const name of ['model.xlsx', 'deck.pptx', 'contract.docx', 'bundle.tar.gz']) {
      const description = describeFileKind(name)
      expect(description.canPreview).toBe(false)
      // The reason has to name what is absent — a bare "unsupported" tells a user nothing
      // about whether the download beside it will work.
      expect(description.cannotPreviewReason).toMatch(/\S/)
    }
    expect(describeFileKind('model.xlsx').cannotPreviewReason).toMatch(/workbook parser/)
    expect(describeFileKind('deck.pptx').cannotPreviewReason).toMatch(/presentation renderer/)
  })

  it('treats an extensionless or dotfile name as binary rather than guessing', () => {
    expect(describeFileKind('Makefile').kind).toBe('binary')
    expect(describeFileKind('.gitignore').kind).toBe('binary')
    expect(describeFileKind('trailing.').extension).toBe('')
  })
})

describe('formatFileSize', () => {
  it('scales, and says nothing for a directory', () => {
    expect(formatFileSize(812)).toBe('812 B')
    expect(formatFileSize(4_498)).toBe('4.5 KB')
    // A decimal on a two-digit number is noise in a right-aligned column, so it drops.
    expect(formatFileSize(13_645)).toBe('14 KB')
    expect(formatFileSize(1_400_000)).toBe('1.4 MB')
    expect(formatFileSize(25 * 1_024 * 1_024)).toBe('26 MB')
    expect(formatFileSize(null)).toBe('')
  })
})

describe('workspace path containment', () => {
  const root = '/home/u/.computer/profiles/sales-outbound/workspace'

  it('refuses a sibling that merely shares the root’s prefix', () => {
    expect(isWithinWorkspace(root, `${root}/archive`)).toBe(true)
    expect(isWithinWorkspace(root, root)).toBe(true)
    expect(isWithinWorkspace(root, `${root}/`)).toBe(true)
    // The endpoint has no root of its own on a stock install, so this is the only guard.
    expect(isWithinWorkspace(root, `${root}-old/secrets`)).toBe(false)
    expect(isWithinWorkspace(root, '/home/u/.computer/profiles/sales-outbound')).toBe(false)
    expect(isWithinWorkspace(root, '/etc')).toBe(false)
  })

  it('builds a trail that always starts at the workspace and never climbs above it', () => {
    expect(buildBreadcrumbs(root, `${root}/archive/2024`)).toEqual([
      { label: 'Workspace', path: root },
      { label: 'archive', path: `${root}/archive` },
      { label: '2024', path: `${root}/archive/2024` },
    ])
    expect(buildBreadcrumbs(root, root)).toEqual([{ label: 'Workspace', path: root }])
    // Out of tree collapses to the root rather than describing a way out of it.
    expect(buildBreadcrumbs(root, '/etc/passwd')).toEqual([
      { label: 'Workspace', path: root },
    ])
  })

  it('has no parent at the root, which is what leaves Back off the page', () => {
    expect(parentWithinWorkspace(root, `${root}/archive/2024`)).toBe(`${root}/archive`)
    expect(parentWithinWorkspace(root, `${root}/archive`)).toBe(root)
    expect(parentWithinWorkspace(root, root)).toBeNull()
  })
})

describe('EmployeeModal', () => {
  beforeEach(() => {
    localStorage.clear()
    useIdentityStore.setState({ overrides: {} })
    useChatStore.setState({ threads: {}, connection: 'open' })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('opens on Info and names what is real on each page of the rail', async () => {
    stubFetch({ servers: SERVERS, files: FILES, env: ENV })
    const user = await openModal()

    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    // Info is the landing page, and it summarises the other three rather than being a
    // lobby: four tiles that each state what the page behind them holds.
    expect(screen.getByRole('heading', { name: 'Sales Outbound' })).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /^Workspace: 2 files\. Last written/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Connectors: 1 of 2 on. github' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Vaults: 3 keys. 1 managed by Channels' }),
    ).toBeInTheDocument()
    // The newest file previews here, so an empty workspace needs no click to discover.
    expect(screen.getByText('prospects.csv')).toBeInTheDocument()

    await openPage(user, 'Files')
    expect(await screen.findByText('Workspace · 2')).toBeInTheDocument()
    expect(screen.getByText('prospects.csv')).toBeInTheDocument()

    await openPage(user, 'Connectors')
    // Real connector rows, each carrying its transport and tool count.
    expect(await screen.findByText('github')).toBeInTheDocument()
    expect(screen.getByText('HTTP · 2 tools')).toBeInTheDocument()
    expect(screen.getByText('stdio · 1 tool')).toBeInTheDocument()
    expect(screen.getByText('1 of 2 on')).toBeInTheDocument()

    await openPage(user, 'Vaults')
    expect(await screen.findByText('Credentials · 3')).toBeInTheDocument()
    expect(screen.getByText('OPENROUTER_API_KEY')).toBeInTheDocument()
  })

  it('sends a glance tile to the page it summarises', async () => {
    stubFetch({ servers: SERVERS, files: FILES, env: ENV })
    const user = await openModal()

    await user.click(await screen.findByRole('button', { name: /^Vaults: 3 keys/ }))
    expect(await screen.findByText('Credentials · 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vaults' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('marks the open page and leaves the other three unmarked', async () => {
    stubFetch()
    const user = await openModal()

    expect(screen.getByRole('button', { name: 'Info' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await openPage(user, 'Vaults')
    expect(screen.getByRole('button', { name: 'Vaults' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Info' })).not.toHaveAttribute('aria-current')
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

  it('states an OAuth requirement without offering a sign-in it cannot run', async () => {
    // Hermes *does* have the flow — `POST /api/mcp/servers/{name}/auth` — but this app hosts
    // neither the popup nor the callback it redirects to. The amber line names the
    // requirement; a button that opened a window and stranded it would be worse.
    // github is `auth: 'oauth'`; the line shows while it is *off*, and is suppressed once
    // it is on — see `describeConnector`.
    stubFetch({ servers: [{ ...SERVERS[0]!, enabled: false }], files: [] })
    const user = await openModal()
    await openPage(user, 'Connectors')

    expect(await screen.findByText('Needs OAuth sign-in')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Sign in/ })).not.toBeInTheDocument()
  })

  it('toggles a connector through the real endpoint', async () => {
    const recorded = stubFetch({ servers: SERVERS, files: [] })
    const user = await openModal()
    await openPage(user, 'Connectors')

    await user.click(await screen.findByRole('button', { name: 'Turn on sqlite' }))

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

    // Colour and shape live behind the pencil now: the eleven-dot grid no longer floats
    // over the name whether or not anyone is editing.
    expect(screen.queryByRole('radio', { name: 'Grape' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Edit Sales Outbound' }))

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

  it('descends into a folder and comes back out by its breadcrumb', async () => {
    const recorded = stubFetch({ servers: [], files: FILES, tree: TREE, env: {} })
    const user = await openModal()
    await openPage(user, 'Files')

    expect(await screen.findByText('Workspace · 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open folder archive' }))

    // The heading names the directory being listed, not the section — "Workspace · 2" over
    // a subfolder's contents would be a false count of the workspace.
    expect(await screen.findByText('archive · 2')).toBeInTheDocument()
    expect(screen.getByText('q3-notes.md')).toBeInTheDocument()
    expect(screen.queryByText('prospects.csv')).not.toBeInTheDocument()

    const trail = screen.getByRole('navigation', { name: 'Workspace path' })
    expect(within(trail).getByRole('button', { name: 'Workspace' })).toBeInTheDocument()

    // Every listing stayed inside the employee's own workspace.
    for (const call of recorded.filter((entry) => entry.url.includes('/api/files?'))) {
      expect(decodeURIComponent(call.url)).toContain(WORKSPACE)
    }

    await user.click(within(trail).getByRole('button', { name: 'Workspace' }))
    expect(await screen.findByText('Workspace · 2')).toBeInTheDocument()
    expect(screen.getByText('prospects.csv')).toBeInTheDocument()
  })

  it('never asks for a directory above the workspace root', async () => {
    // `/api/files` has no root of its own unless the operator pinned one, so an out-of-tree
    // path would be *listed*, not refused. The guard has to be here.
    const escapee: HermesManagedFile[] = [
      {
        name: '..',
        path: PROFILE_PATH,
        is_directory: true,
        size: null,
        mtime: 1_700_000_000,
        mime_type: null,
      },
    ]
    const recorded = stubFetch({ servers: [], files: escapee, env: {} })
    const user = await openModal()
    await openPage(user, 'Files')

    await user.click(await screen.findByRole('button', { name: 'Open folder ..' }))

    await waitFor(() => {
      expect(recorded.some((entry) => entry.url.includes('/api/files?'))).toBe(true)
    })
    for (const call of recorded.filter((entry) => entry.url.includes('/api/files?'))) {
      expect(decodeURIComponent(call.url)).toContain(`path=${WORKSPACE}`)
    }
  })

  it('opens a file in the viewer, renders its markdown, and always offers the download', async () => {
    window.__COMPUTER_SESSION_TOKEN__ = 'tok-123'
    stubFetch({ servers: [], files: FILES, tree: TREE, env: {} })
    const user = await openModal()
    await openPage(user, 'Files')

    await user.click(await screen.findByRole('button', { name: 'Open folder archive' }))
    await user.click(await screen.findByRole('button', { name: 'Open q3-notes.md' }))

    const viewer = await screen.findByRole('dialog', { name: 'q3-notes.md' })
    expect(await within(viewer).findByRole('heading', { name: 'Q3 notes' })).toBeInTheDocument()
    expect(within(viewer).getByText('Pipeline held.')).toBeInTheDocument()

    // A real link, not a click handler: the browser streams the response to disk and takes
    // the name from `Content-Disposition`. The token rides in the query because a
    // browser-opened download cannot set the session header — `/api/files/download` is the
    // one route `_QUERY_TOKEN_API_PATHS` allows that for.
    const download = within(viewer).getByRole('link', { name: 'Download' })
    const href = download.getAttribute('href') ?? ''
    expect(href).toContain('/api/files/download')
    expect(href).toContain(encodeURIComponent(`${WORKSPACE}/archive/q3-notes.md`))
    expect(href).toContain('token=tok-123')
    expect(href).not.toContain('/api/files/read')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'q3-notes.md' })).not.toBeInTheDocument()
    })
    // The card is still behind it.
    expect(screen.getByText('archive · 2')).toBeInTheDocument()
    delete window.__COMPUTER_SESSION_TOKEN__
  })

  it('names the missing renderer for a spreadsheet instead of showing an empty frame', async () => {
    // Nothing installed here opens an xlsx — no SheetJS, no pptx renderer — and that is a
    // dependency fact, not a backend gap: the download hands over the real bytes.
    stubFetch({ servers: [], files: FILES, tree: TREE, env: {} })
    const user = await openModal()
    await openPage(user, 'Files')

    await user.click(await screen.findByRole('button', { name: 'Open folder archive' }))
    await user.click(await screen.findByRole('button', { name: 'Open model.xlsx' }))

    const viewer = await screen.findByRole('dialog', { name: 'model.xlsx' })
    expect(within(viewer).getByText('No preview for .xlsx here')).toBeInTheDocument()
    expect(
      within(viewer).getByText(/Spreadsheets need a workbook parser, and this app ships none/),
    ).toBeInTheDocument()
    expect(within(viewer).getByRole('link', { name: 'Download' })).toBeInTheDocument()
  })

  it('says the workspace is empty rather than inventing an authored-by list', async () => {
    stubFetch({ servers: [], files: [], env: {} })
    const user = await openModal()

    await openPage(user, 'Files')
    expect(
      await screen.findByText(/Nothing in Sales Outbound’s workspace yet/),
    ).toBeInTheDocument()

    await openPage(user, 'Connectors')
    expect(
      await screen.findByText(/No MCP servers are configured for this employee/),
    ).toBeInTheDocument()

    await openPage(user, 'Vaults')
    expect(
      await screen.findByText(/Sales Outbound holds no credentials/),
    ).toBeInTheDocument()
  })
})

describe('model picker', () => {
  beforeEach(() => {
    useChatStore.setState({ connection: 'open', threads: {} })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the current model on the state line and offers only authenticated providers', async () => {
    stubFetch()
    const user = await openModal()

    const trigger = await screen.findByRole('button', {
      name: /Model: anthropic\/claude-sonnet-4\.6\. Change model/,
    })
    await user.click(trigger)

    expect(await screen.findByText('OpenRouter')).toBeInTheDocument()
    // Listed by the backend but not signed in, and this app has no way to sign one
    // in — so it is dropped rather than offered as a control that cannot succeed.
    expect(screen.queryByText('Google AI Studio')).not.toBeInTheDocument()
    expect(screen.queryByText('gemini-3-pro')).not.toBeInTheDocument()
  })

  it('writes the provider slug and model to the profile, not the display name', async () => {
    const recorded = stubFetch()
    const user = await openModal()

    await user.click(
      await screen.findByRole('button', {
        name: /Model: anthropic\/claude-sonnet-4\.6\. Change model/,
      }),
    )
    await user.click(await screen.findByRole('menuitem', { name: /z-ai\/glm-4\.7/ }))

    await waitFor(() => {
      const put = recorded.find((call) => call.method === 'PUT' && call.url.includes('/model'))
      expect(put).toBeDefined()
      expect(put?.url).toContain('/api/profiles/sales-outbound/model')
      expect(put?.body).toEqual({ provider: 'openrouter', model: 'z-ai/glm-4.7' })
    })
  })
})

describe('toVaultKeys', () => {
  it('lists only the keys that are set, because the endpoint answers the catalogue', () => {
    // The real payload is 295 rows against 2 set. Without the `is_set` filter the page
    // would claim the employee holds every service Hermes has ever heard of.
    expect(toVaultKeys(fromWire(ENV)).map((row) => row.name)).toEqual([
      'FAL_KEY',
      'OPENROUTER_API_KEY',
      'TELEGRAM_BOT_TOKEN',
    ])
  })

  it('names where a key came from, most specific answer first', () => {
    const rows = toVaultKeys(fromWire(ENV))
    expect(rows.find((row) => row.name === 'OPENROUTER_API_KEY')?.origin).toBe('OpenRouter')
    // No provider_label on this one, so it falls back to what the category says.
    expect(rows.find((row) => row.name === 'FAL_KEY')?.origin).toBe('Tool credential')
  })

  it('carries channel_managed through, so the row can be left read-only', () => {
    const telegram = toVaultKeys(fromWire(ENV)).find(
      (row) => row.name === 'TELEGRAM_BOT_TOKEN',
    )
    expect(telegram?.channelManaged).toBe(true)
  })

  it('reads an unanswered store as empty rather than throwing', () => {
    expect(toVaultKeys(undefined)).toEqual([])
  })
})

describe('isValidKeyName', () => {
  it('mirrors the rule save_env_value enforces, and nothing more', () => {
    expect(isValidKeyName('OPENAI_API_KEY')).toBe(true)
    expect(isValidKeyName('_private')).toBe(true)
    expect(isValidKeyName('9LIVES')).toBe(false)
    expect(isValidKeyName('HAS-DASH')).toBe(false)
    expect(isValidKeyName('')).toBe(false)
    // The denylist (PATH, LD_PRELOAD, COMPUTER_HOME) is deliberately server-side only: a
    // copy here would drift, and a refusal comes back as a 400 the form prints verbatim.
    expect(isValidKeyName('PATH')).toBe(true)
  })
})

describe('EmployeeModal · Vaults', () => {
  beforeEach(() => {
    localStorage.clear()
    useIdentityStore.setState({ overrides: {} })
    useChatStore.setState({ threads: {}, connection: 'open' })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('shows the masked value Hermes computed, never a value of its own', async () => {
    stubFetch({ env: ENV })
    const user = await openModal()
    await openPage(user, 'Vaults')

    expect(await screen.findByText('k-or...8e34')).toBeInTheDocument()
    expect(screen.getByText('OpenRouter')).toBeInTheDocument()
  })

  it('reveals a value through the audited endpoint, and hides it again locally', async () => {
    const recorded = stubFetch({ env: ENV })
    const user = await openModal()
    await openPage(user, 'Vaults')

    await user.click(await screen.findByRole('button', { name: 'Reveal OPENROUTER_API_KEY' }))
    expect(await screen.findByText('sk-or-v1-the-real-thing')).toBeInTheDocument()

    const reveal = recorded.find((call) => call.url.includes('/api/env/reveal'))
    expect(reveal?.method).toBe('POST')
    expect(reveal?.body).toEqual({ key: 'OPENROUTER_API_KEY', profile: 'sales-outbound' })

    // Hiding is local — no second call, and the plaintext leaves the DOM.
    await user.click(screen.getByRole('button', { name: 'Hide OPENROUTER_API_KEY' }))
    expect(screen.queryByText('sk-or-v1-the-real-thing')).not.toBeInTheDocument()
    expect(recorded.filter((call) => call.url.includes('/api/env/reveal'))).toHaveLength(1)
  })

  it('writes a new key to this employee’s own .env', async () => {
    const recorded = stubFetch({ env: ENV })
    const user = await openModal()
    await openPage(user, 'Vaults')

    await user.click(await screen.findByRole('button', { name: 'Add key' }))
    await user.type(screen.getByLabelText('Key name'), 'stripe_secret')
    await user.type(screen.getByLabelText('Key value'), 'sk_live_123')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      const put = recorded.find((call) => call.method === 'PUT' && call.url.includes('/api/env'))
      // Upper-cased in the field, and scoped by profile — `_profile_scope` re-roots
      // COMPUTER_HOME so the write lands in this employee's .env and no other.
      expect(put?.body).toEqual({
        key: 'STRIPE_SECRET',
        value: 'sk_live_123',
        profile: 'sales-outbound',
      })
    })
  })

  it('refuses a malformed name before it reaches the wire', async () => {
    const recorded = stubFetch({ env: ENV })
    const user = await openModal()
    await openPage(user, 'Vaults')

    await user.click(await screen.findByRole('button', { name: 'Add key' }))
    await user.type(screen.getByLabelText('Key name'), '9lives')
    await user.type(screen.getByLabelText('Key value'), 'x')

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(recorded.some((call) => call.method === 'PUT')).toBe(false)
  })

  it('removes a key through the endpoint that also clears its mirrors', async () => {
    const recorded = stubFetch({ env: ENV })
    const user = await openModal()
    await openPage(user, 'Vaults')

    await user.click(await screen.findByRole('button', { name: 'Manage FAL_KEY' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Remove' }))

    await waitFor(() => {
      const call = recorded.find((entry) => entry.method === 'DELETE')
      expect(call?.url).toContain('/api/env')
      expect(call?.body).toEqual({ key: 'FAL_KEY', profile: 'sales-outbound' })
    })
  })

  it('leaves a channel-managed credential to the page that owns it', async () => {
    stubFetch({ env: ENV })
    const user = await openModal()
    await openPage(user, 'Vaults')

    // Listed, because the employee does hold it — but with no edit control, because the
    // dashboard's Channels card configures the whole platform pairing, not one variable.
    expect(await screen.findByText('TELEGRAM_BOT_TOKEN')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Manage TELEGRAM_BOT_TOKEN' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('note', {
        name: /TELEGRAM_BOT_TOKEN is managed by the Hermes dashboard/,
      }),
    ).toBeInTheDocument()
  })
})
