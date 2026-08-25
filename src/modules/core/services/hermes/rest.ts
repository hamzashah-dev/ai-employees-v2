import { API_BASE, authHeaders } from './config'
import type {
  HermesCronJob,
  HermesCronJobsResponse,
  HermesProfile,
  HermesProfilesResponse,
  HermesSearchHit,
  HermesSearchResponse,
  HermesSessionRow,
  HermesSessionsResponse,
  HermesStatus,
} from './types'

export class HermesHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly path: string,
  ) {
    super(message)
    this.name = 'HermesHttpError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      // Non-JSON error body; the status text will have to do.
    }
    throw new HermesHttpError(
      response.status,
      response.status === 401
        ? 'Not authorised. The dashboard session token is missing or stale — reload the page.'
        : detail,
      path,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

// ------------------------------------------------------------------ status

export function fetchStatus(): Promise<HermesStatus> {
  return request<HermesStatus>('/api/status')
}

// ---------------------------------------------------------------- profiles

export async function fetchProfiles(): Promise<HermesProfile[]> {
  const data = await request<HermesProfilesResponse>('/api/profiles')
  return data.profiles ?? []
}

export function createProfile(body: {
  name: string
  clone_from?: string
  description?: string
  provider?: string
  model?: string
  hub_skills?: string[]
}): Promise<unknown> {
  return request('/api/profiles', { method: 'POST', body: JSON.stringify(body) })
}

export function deleteProfile(name: string): Promise<unknown> {
  return request(`/api/profiles/${encodeURIComponent(name)}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------- sessions

/**
 * Sessions are per-profile on disk, so `profile` is required rather than
 * optional — omitting it silently reads the launch profile's state.db and
 * returns another employee's history.
 */
export async function fetchSessions(
  profile: string,
  options: { limit?: number; order?: 'recent' | 'created' } = {},
): Promise<HermesSessionRow[]> {
  const params = new URLSearchParams({
    profile,
    limit: String(options.limit ?? 30),
    order: options.order ?? 'recent',
    min_messages: '1',
    archived: 'exclude',
  })
  const data = await request<HermesSessionsResponse>(`/api/sessions?${params}`)
  return data.sessions ?? []
}

export async function fetchSessionMessages(
  sessionId: string,
  profile: string,
  options: { limit?: number; offset?: number } = {},
): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({ profile })
  if (options.limit != null) params.set('limit', String(options.limit))
  if (options.offset != null) params.set('offset', String(options.offset))
  const data = await request<{ messages?: Record<string, unknown>[] }>(
    `/api/sessions/${encodeURIComponent(sessionId)}/messages?${params}`,
  )
  return data.messages ?? []
}

/**
 * Each slice of the sidebar payload is an object — `{sessions, total, …}` — not
 * a bare array, and `cron` omits `total` entirely. Unwrap defensively so a
 * shape change degrades to an empty list rather than throwing inside a render.
 */
function toSessionRows(slice: unknown): HermesSessionRow[] {
  if (Array.isArray(slice)) return slice as HermesSessionRow[]
  if (slice && typeof slice === 'object') {
    const sessions = (slice as { sessions?: unknown }).sessions
    if (Array.isArray(sessions)) return sessions as HermesSessionRow[]
  }
  return []
}

/**
 * One batched call giving recent sessions across every profile. Used to put a
 * last-outcome line and a timestamp on each roster row without N requests.
 */
export async function fetchSidebarSessions(): Promise<{
  recents: HermesSessionRow[]
  cron: HermesSessionRow[]
  messaging: HermesSessionRow[]
}> {
  const params = new URLSearchParams({
    recents_profile: 'all',
    recents_limit: '100',
    cron_limit: '50',
    messaging_limit: '50',
  })
  const data = await request<Record<string, unknown>>(
    `/api/profiles/sessions/sidebar?${params}`,
  )
  return {
    recents: toSessionRows(data.recents),
    cron: toSessionRows(data.cron),
    messaging: toSessionRows(data.messaging),
  }
}

// ---------------------------------------------------------------- routines

export async function fetchCronJobs(profile: string): Promise<HermesCronJob[]> {
  const data = await request<HermesCronJobsResponse | HermesCronJob[]>(
    `/api/cron/jobs?profile=${encodeURIComponent(profile)}`,
  )
  if (Array.isArray(data)) return data
  return data.jobs ?? []
}

export function pauseCronJob(jobId: string, profile: string): Promise<unknown> {
  return request(
    `/api/cron/jobs/${encodeURIComponent(jobId)}/pause?profile=${encodeURIComponent(profile)}`,
    { method: 'POST' },
  )
}

export function resumeCronJob(jobId: string, profile: string): Promise<unknown> {
  return request(
    `/api/cron/jobs/${encodeURIComponent(jobId)}/resume?profile=${encodeURIComponent(profile)}`,
    { method: 'POST' },
  )
}

export function triggerCronJob(jobId: string, profile: string): Promise<unknown> {
  return request(
    `/api/cron/jobs/${encodeURIComponent(jobId)}/trigger?profile=${encodeURIComponent(profile)}`,
    { method: 'POST' },
  )
}

/**
 * Every routine across every employee, in one call.
 *
 * `profile=all` is the endpoint's own default, and it fans out over the profile
 * list server-side, annotating each job with the profile that owns it. The
 * routines table therefore costs one request rather than one per employee.
 */
export async function fetchAllCronJobs(): Promise<HermesCronJob[]> {
  const data = await request<HermesCronJobsResponse | HermesCronJob[]>(
    '/api/cron/jobs?profile=all',
  )
  if (Array.isArray(data)) return data
  return data.jobs ?? []
}

export interface CronJobDraft {
  /** What the employee is asked to do. Must stand on its own — cron runs it cold. */
  prompt: string
  /**
   * Parsed by `parse_schedule`: a cron expression (`0 8 * * 1-5`), an interval
   * (`every 30m`), a one-shot duration (`2h`) or an ISO timestamp. The editor
   * only ever sends the first two.
   */
  schedule: string
  name?: string
  /**
   * `local` saves the output without pushing it anywhere. It is the only target
   * this app can honestly offer: the others are gateway platforms (Telegram,
   * Slack…) that need a configured home channel, which is a Hermes-side setup
   * step with no surface here.
   */
  deliver?: string
}

export function createCronJob(
  draft: CronJobDraft,
  profile: string,
): Promise<HermesCronJob> {
  return request<HermesCronJob>(
    `/api/cron/jobs?profile=${encodeURIComponent(profile)}`,
    { method: 'POST', body: JSON.stringify({ deliver: 'local', ...draft }) },
  )
}

/** A partial edit. Hermes wraps the patch in `{updates}` rather than taking it bare. */
export function updateCronJob(
  jobId: string,
  updates: Partial<CronJobDraft>,
  profile: string,
): Promise<HermesCronJob> {
  return request<HermesCronJob>(
    `/api/cron/jobs/${encodeURIComponent(jobId)}?profile=${encodeURIComponent(profile)}`,
    { method: 'PUT', body: JSON.stringify({ updates }) },
  )
}

export function deleteCronJob(jobId: string, profile: string): Promise<unknown> {
  return request(
    `/api/cron/jobs/${encodeURIComponent(jobId)}?profile=${encodeURIComponent(profile)}`,
    { method: 'DELETE' },
  )
}

// ------------------------------------------------------------------ search

/**
 * Full-text search over a profile's messages, backed by FTS5.
 *
 * Sessions live in a per-profile `state.db`, so this is one call per employee
 * rather than one call for the roster — there is no cross-profile search route.
 * An empty or whitespace query is answered `{results: []}` server-side; it is
 * short-circuited here so an empty box costs nothing.
 */
export async function searchSessions(
  query: string,
  profile: string,
  limit = 20,
): Promise<HermesSearchHit[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({ q: query, profile, limit: String(limit) })
  const data = await request<HermesSearchResponse>(`/api/sessions/search?${params}`)
  return data.results ?? []
}
