import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  fetchSidebarSessions,
  fetchProfiles,
  fetchCronJobs,
  fetchSystemStatus,
  fetchGlobalEnv,
  fetchProfileEnv,
  fetchMemoryFile,
  saveMemoryFile,
} from './rest'

/**
 * These assert against the payload shapes the live dashboard actually returns,
 * captured from `:9121`. The sidebar one exists because an earlier guess — that
 * each slice was a bare array — put `[...sessions.recents]` in a render path and
 * took the whole sidebar down with "recents is not iterable".
 */

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Trimmed from a real row; the live one carries ~48 columns. */
const REAL_ROW = {
  id: '20260825_180416_fe6ef1',
  source: 'smoke',
  model: 'gpt-4o-mini',
  started_at: 1787663056.5503109,
  ended_at: 1787663082.164072,
  last_active: 1787663082.164072,
  message_count: 1,
  title: null,
  preview: 'Ran your weekly expense pass.',
  profile: 'ad-creator',
  archived: 0,
  is_active: false,
}

/** The real envelope: each slice is an object, and `cron` has no `total`. */
const REAL_SIDEBAR = {
  recents: { sessions: [REAL_ROW], total: 1, profile_totals: { 'ad-creator': 1 } },
  cron: { sessions: [] },
  messaging: { sessions: [], total: 0 },
  errors: [],
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchSidebarSessions', () => {
  it('unwraps the object-wrapped slices the dashboard really returns', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(REAL_SIDEBAR)))

    const result = await fetchSidebarSessions()

    expect(Array.isArray(result.recents)).toBe(true)
    expect(result.recents).toHaveLength(1)
    expect(result.recents[0]?.profile).toBe('ad-creator')
    expect(result.cron).toEqual([])
    expect(result.messaging).toEqual([])
  })

  it('still works if a slice ever becomes a bare array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ recents: [REAL_ROW], cron: [], messaging: [] })),
    )

    const result = await fetchSidebarSessions()
    expect(result.recents).toHaveLength(1)
  })

  it('degrades to empty lists rather than throwing on an unexpected shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ recents: null, cron: 'nope', messaging: undefined })),
    )

    const result = await fetchSidebarSessions()
    expect(result).toEqual({ recents: [], cron: [], messaging: [] })
  })

  it('every returned slice is spreadable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(REAL_SIDEBAR)))

    const result = await fetchSidebarSessions()
    // The exact operation that crashed the sidebar.
    expect(() => [...result.recents, ...result.cron, ...result.messaging]).not.toThrow()
  })
})

describe('fetchProfiles', () => {
  it('reads the profiles array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ profiles: [{ name: 'ad-creator' }] })),
    )

    const profiles = await fetchProfiles()
    expect(profiles[0]?.name).toBe('ad-creator')
  })

  it('returns an empty list when the key is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({})))
    await expect(fetchProfiles()).resolves.toEqual([])
  })

  it('explains a 401 in terms the user can act on', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ detail: 'Unauthorized' }, 401)))
    await expect(fetchProfiles()).rejects.toThrow(/token/i)
  })
})

describe('fetchCronJobs', () => {
  it('accepts either a bare array or a wrapped object', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse([{ id: 'a' }])))
    await expect(fetchCronJobs('ad-creator')).resolves.toHaveLength(1)

    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ jobs: [{ id: 'b' }] })))
    await expect(fetchCronJobs('ad-creator')).resolves.toHaveLength(1)
  })

  it('scopes the request to the employee', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ jobs: [] }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await fetchCronJobs('ad-creator')

    // Omitting the profile silently reads the launch profile's jobs.
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('profile=ad-creator')
  })
})

/**
 * Trimmed from the live `/api/status` at `:9121`. Every key here was present on
 * that payload — including the four the Settings System card needs and cannot
 * get anywhere else (`env_path`, `profiles`, `disk`, `install_id`).
 */
const REAL_STATUS = {
  version: '0.20.6',
  gateway_running: true,
  gateway_state: 'running',
  profiles: ['default', 'ad-creator', 'chief-of-staff'],
  disk: { pressure: 'ok', total_mb: 471_482, free_mb: 188_613, used_percent: 60 },
  install_id: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
  computer_home: '/Users/dev/.computer',
  env_path: '/Users/dev/.computer/.env',
  overall: 'degraded',
}

function recordingFetch(body: unknown, status = 200) {
  return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    jsonResponse(body, status),
  )
}

describe('fetchSystemStatus', () => {
  it('asks the unscoped endpoint, because the card describes the machine', async () => {
    const fetchMock = recordingFetch(REAL_STATUS)
    vi.stubGlobal('fetch', fetchMock)

    const status = await fetchSystemStatus()

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toContain('/api/status')
    // `?profile=` would repoint the gateway readout at one employee's state file.
    expect(String(url)).not.toContain('profile=')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(status.version).toBe('0.20.6')
    expect(status.profiles).toEqual(['default', 'ad-creator', 'chief-of-staff'])
    expect(status.env_path).toBe('/Users/dev/.computer/.env')
    expect(status.disk?.free_mb).toBe(188_613)
    expect(status.disk?.pressure).toBe('ok')
  })

  it('reads a gated bind, where the host paths are absent rather than empty', async () => {
    // On a non-loopback bind `get_status` omits computer_home / env_path / the
    // gateway pid entirely. A 200 with those keys missing is the normal answer,
    // so the card must render "unavailable", not an empty path.
    const { computer_home: _home, env_path: _env, install_id: _id, ...gated } = REAL_STATUS
    vi.stubGlobal('fetch', recordingFetch(gated))

    const status = await fetchSystemStatus()

    expect(status.computer_home).toBeUndefined()
    expect(status.env_path).toBeUndefined()
    expect(status.install_id).toBeUndefined()
    expect(status.gateway_running).toBe(true)
  })

  it('leaves an unreadable disk sample unknown instead of zero', async () => {
    // The status route's own `except` path answers `{pressure: 'unknown'}` with
    // no number keys at all — "we could not read it", never "0 MB free".
    vi.stubGlobal('fetch', recordingFetch({ ...REAL_STATUS, disk: { pressure: 'unknown' } }))

    const status = await fetchSystemStatus()

    expect(status.disk?.pressure).toBe('unknown')
    expect(status.disk?.free_mb).toBeUndefined()
    expect(status.disk?.used_percent).toBeUndefined()
  })
})

/** One row in the shape `/api/env` really returns, for both env readers. */
const ENV_ROWS = {
  FAL_KEY: {
    is_set: true,
    redacted_value: 'fal_…9c2d',
    description: 'Fal AI',
    category: 'media',
    is_password: true,
    provider_label: 'Fal',
    tools: ['generate_image'],
  },
}

describe('fetchGlobalEnv', () => {
  it('sends no profile param, so it reads the dashboard\'s own .env', async () => {
    const fetchMock = recordingFetch(ENV_ROWS)
    vi.stubGlobal('fetch', fetchMock)

    await fetchGlobalEnv()

    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('/api/env')
    // With a profile the answer would be one employee's file, not the workspace's.
    expect(url).not.toContain('profile')
  })

  it('answers the same mapped shape as the scoped read', async () => {
    vi.stubGlobal('fetch', recordingFetch(ENV_ROWS))
    const workspace = await fetchGlobalEnv()

    vi.stubGlobal('fetch', recordingFetch(ENV_ROWS))
    const employee = await fetchProfileEnv('ad-creator')

    expect(workspace).toEqual(employee)
    expect(workspace.FAL_KEY?.isSet).toBe(true)
    expect(workspace.FAL_KEY?.redactedValue).toBe('fal_…9c2d')
    expect(workspace.FAL_KEY?.providerLabel).toBe('Fal')
  })
})

describe('fetchMemoryFile', () => {
  it('reads the account-level MEMORY.md', async () => {
    const fetchMock = recordingFetch({
      content: '- Node toolchain is broken\n',
      path: '/Users/dev/.computer/memories/MEMORY.md',
      exists: true,
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = await fetchMemoryFile()

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toContain('/api/memory/file')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(file.content).toBe('- Node toolchain is broken\n')
    expect(file.exists).toBe(true)
  })

  it('passes through the never-written state without coercing it', async () => {
    // A workspace with no memory yet answers 200 `{content: '', exists: false}`.
    // `exists` is the only thing separating that from a document the user emptied.
    vi.stubGlobal(
      'fetch',
      recordingFetch({ content: '', path: '/Users/dev/.computer/memories/MEMORY.md', exists: false }),
    )

    const file = await fetchMemoryFile()

    expect(file.exists).toBe(false)
    expect(file.content).toBe('')
  })
})

describe('saveMemoryFile', () => {
  it('PUTs the whole document as JSON', async () => {
    const fetchMock = recordingFetch({ ok: true, bytes: 12 })
    vi.stubGlobal('fetch', fetchMock)

    await saveMemoryFile('- one\n- two\n')

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toContain('/api/memory/file')
    expect(init?.method).toBe('PUT')
    // FastAPI rejects the body without this, and `request()` only adds it when
    // a body is present.
    const headers = init?.headers as Record<string, string> | undefined
    expect(headers?.['Content-Type']).toBe('application/json')
    expect(JSON.parse(String(init?.body))).toEqual({ content: '- one\n- two\n' })
  })
})
