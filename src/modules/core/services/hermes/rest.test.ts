import { describe, expect, it, vi, afterEach } from 'vitest'
import { fetchSidebarSessions, fetchProfiles, fetchCronJobs } from './rest'

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
