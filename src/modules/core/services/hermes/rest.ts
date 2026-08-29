import { API_BASE, authHeaders, getSessionToken } from './config'
import type {
  HermesCronJob,
  HermesCronJobsResponse,
  HermesEnvResponse,
  HermesFileContent,
  HermesFileListing,
  HermesManagedFile,
  HermesProfile,
  HermesProfileInstallResult,
  HermesProfilesResponse,
  HermesMcpServer,
  HermesMcpServersResponse,
  HermesModelOptions,
  HermesSearchHit,
  HermesSearchResponse,
  HermesSessionRow,
  HermesSessionsResponse,
  HermesStatus,
  HermesTranscription,
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
  /**
   * Copy the default profile's config.yaml, .env and skills into the new one.
   * `ProfileCreate` in computer_cli/web_server.py has always accepted this; the
   * type just never listed it. It is how a hire inherits the browser identity
   * block that makes a signed-in session persist across runs.
   */
  clone_from_default?: boolean
  description?: string
  provider?: string
  model?: string
  hub_skills?: string[]
}): Promise<unknown> {
  return request('/api/profiles', { method: 'POST', body: JSON.stringify(body) })
}

/**
 * Overwrite a profile's `SOUL.md` — the system prompt Hermes loads on every run.
 *
 * `POST /api/profiles` seeds a name, a description and the bundled skills, but
 * leaves SOUL.md as the stock Computer Agent boilerplate. A hired agent
 * therefore has the right tools and the wrong identity until this is called.
 */
export function updateProfileSoul(name: string, content: string): Promise<unknown> {
  return request(`/api/profiles/${encodeURIComponent(name)}/soul`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export function deleteProfile(name: string): Promise<unknown> {
  return request(`/api/profiles/${encodeURIComponent(name)}`, { method: 'DELETE' })
}

/**
 * Hire an agent from a distribution pack — the declarative alternative to
 * `createProfile` + `updateProfileSoul`.
 *
 * `source` is a pack directory in the Computer repo (`agents/linkedin-agent`)
 * or a git URL; the pack's `distribution.yaml` supplies the name, description,
 * model, SOUL.md and skills, so an agent's identity lives in a reviewable file
 * rather than in this client. One call instead of two, and `force: true`
 * re-installs in place without touching the agent's memories, sessions, auth
 * or `.env`.
 *
 * `env_requires` in the response is what the agent still needs before it can
 * work — render it as the post-hire setup list.
 */
export function installProfile(body: {
  source: string
  name?: string
  force?: boolean
  create_alias?: boolean
}): Promise<HermesProfileInstallResult> {
  return request<HermesProfileInstallResult>('/api/profiles/install', {
    method: 'POST',
    body: JSON.stringify(body),
  })
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

// ------------------------------------------------------------ integrations

/**
 * The MCP servers this employee can reach.
 *
 * Scoped by profile for the same reason sessions are: `_profile_scope` reads
 * the named profile's `config.yaml`, and omitting the name silently reports the
 * launch profile's servers instead of this employee's.
 */
export async function fetchMcpServers(profile: string): Promise<HermesMcpServer[]> {
  const data = await request<HermesMcpServersResponse>(
    `/api/mcp/servers?profile=${encodeURIComponent(profile)}`,
  )
  return data.servers ?? []
}

/**
 * Flip a server's `enabled` flag.
 *
 * Hermes reads that flag when a session starts, so the change lands on the next
 * turn rather than the current one — the dropdown says so rather than implying
 * an instant effect.
 */
export function setMcpServerEnabled(
  name: string,
  enabled: boolean,
  profile: string,
): Promise<unknown> {
  return request(
    `/api/mcp/servers/${encodeURIComponent(name)}/enabled?profile=${encodeURIComponent(profile)}`,
    { method: 'PUT', body: JSON.stringify({ enabled, profile }) },
  )
}

// ------------------------------------------------------------------- files

/**
 * A directory listing from the managed-files API.
 *
 * **`/api/files` takes no `profile` parameter at all.** `list_managed_files` is
 * `(request, path)` — nothing else — and FastAPI silently drops the extra query key, so a
 * hopeful `?profile=ad-creator` returns the *operating-system home directory* with a 200
 * and no hint that the scoping was ignored. This was checked against the running backend,
 * not assumed. Scoping is therefore the caller's job: pass an absolute `path`, and get it
 * from `GET /api/profiles` (`HermesProfile.path`), which is the only place Hermes says
 * where an employee lives on disk.
 *
 * The server sorts directories-then-name; anything wanting recency has to re-sort on
 * `mtime` itself.
 */
export async function fetchFiles(path: string): Promise<HermesManagedFile[]> {
  const data = await request<HermesFileListing>(
    `/api/files?path=${encodeURIComponent(path)}`,
  )
  return data.entries ?? []
}

/**
 * One file's bytes, as a `data:` URL.
 *
 * Answers 413 above 100MB and 403 for anything `_is_sensitive_path` rejects (`.env`,
 * `auth.json`, and every path under `pairing/` or `mcp-tokens/`) — so a file visible in a
 * listing is always readable, because the listing applies the same filter.
 */
export function fetchFileContent(path: string): Promise<HermesFileContent> {
  return request<HermesFileContent>(`/api/files/read?path=${encodeURIComponent(path)}`)
}

/**
 * A URL a browser can hit directly for one file's bytes.
 *
 * `/api/files/download` is the only route in `_QUERY_TOKEN_API_PATHS`
 * (`computer_cli/web_server.py:371`), and it is on that list for exactly this reason: a
 * `<a download>`, an `<img src>` or a `<video src>` cannot set the session header, so the
 * token has to travel in the query string. Every other guard still applies — the 403 on
 * `_is_sensitive_path` and the 413 over `_MANAGED_FILE_MAX_BYTES` are the same ones
 * `/api/files/read` enforces.
 *
 * Preferred over `/api/files/read` wherever a browser can consume bytes directly: `read`
 * base64s the whole file into a data URL, which costs ~33% inflation, a full copy in JS
 * memory, and a string long enough to be refused as a URL. This streams, and Starlette's
 * `FileResponse` answers `Range` with a 206 — verified against the running backend — so a
 * `<video>` pointed here seeks without downloading the rest.
 *
 * The response carries `Content-Disposition: attachment`, which browsers apply to
 * *navigations* (a link, an iframe) but not to media subresources. That asymmetry is the
 * whole design of the viewer: `<img>`/`<video>` use this URL, a PDF must not.
 */
export function managedFileUrl(path: string): string {
  const token = getSessionToken()
  const auth = token ? `&token=${encodeURIComponent(token)}` : ''
  return `${API_BASE}/api/files/download?path=${encodeURIComponent(path)}${auth}`
}

/**
 * One file's bytes, streamed rather than base64'd.
 *
 * The `Blob` comes back typed from the response's own `Content-Type`, which
 * `download_managed_file` guesses from the filename — so `URL.createObjectURL` on it yields
 * a URL an `<iframe>` will actually render. That is the point: an iframe pointed at the
 * endpoint directly never fires `onload`, because Chrome honours the attachment disposition
 * and turns the navigation into a download. Verified both ways in Chrome.
 *
 * Callers own the object URL and must revoke it — an unrevoked one pins the whole file in
 * memory for the life of the document.
 */
export async function fetchManagedFileBlob(path: string): Promise<Blob> {
  const url = `/api/files/download?path=${encodeURIComponent(path)}`
  const response = await fetch(`${API_BASE}${url}`, { headers: authHeaders() })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      // Non-JSON error body; the status text will have to do.
    }
    throw new HermesHttpError(response.status, detail, url)
  }

  return response.blob()
}

// ------------------------------------------------------------------- audio

/**
 * Transcribe a recording made in the browser.
 *
 * The endpoint takes a base64 data URL rather than multipart, and answers a
 * *successful* empty transcript for silence — the caller should treat `''` as
 * "nothing was said", not as a failure.
 */
export async function transcribeAudio(
  dataUrl: string,
  mimeType: string,
): Promise<string> {
  const data = await request<HermesTranscription>('/api/audio/transcribe', {
    method: 'POST',
    body: JSON.stringify({ data_url: dataUrl, mime_type: mimeType }),
  })
  return (data.transcript ?? '').trim()
}

// ------------------------------------------------------------------ models

/**
 * The models this employee could run on.
 *
 * Scoped by profile because the picker context is per-profile — current model,
 * custom providers from that profile's config, and its own `.env` auth state.
 * Unscoped, it answers for the launch profile and would offer a roster of
 * providers this employee cannot actually reach.
 *
 * Only providers already configured come back; `include_unconfigured` would add
 * the ones needing setup, and this app has no surface for authenticating one.
 */
export function fetchModelOptions(profile: string): Promise<HermesModelOptions> {
  return request<HermesModelOptions>(
    `/api/model/options?profile=${encodeURIComponent(profile)}`,
  )
}

/**
 * Point an employee at a different model.
 *
 * Writes `model.default` + `model.provider` in that profile's own `config.yaml`
 * without touching the dashboard's active profile. Both fields are required —
 * the endpoint 400s on an empty either — and it lands on the next turn rather
 * than the one in flight, the same as the MCP `enabled` flag.
 */
export function setProfileModel(
  profile: string,
  provider: string,
  model: string,
): Promise<unknown> {
  return request(`/api/profiles/${encodeURIComponent(profile)}/model`, {
    method: 'PUT',
    body: JSON.stringify({ provider, model }),
  })
}


// ------------------------------------------------------------ credentials

/**
 * The per-employee key store — the only real one Hermes has.
 *
 * `GET /api/env?profile=<name>` answers a dict of every environment variable it knows
 * about, each row carrying `is_set`, `redacted_value` and `is_password`
 * (`computer_cli/web_server.py:7365`). `PUT /api/env` writes one, scoped by `body.profile`,
 * and lands it in that profile's own `.env` (`_profile_scope` → `save_env_value` →
 * `get_computer_home()/.env`). `load_env` reads that one file and nothing else — there is no
 * inheritance from the root install's `.env`, which is why this is honestly per-employee.
 *
 * Arbitrary names are accepted so long as they match `^[A-Za-z_][A-Za-z0-9_]*$` and are not
 * on the writer denylist (`PATH`, `LD_PRELOAD`, `COMPUTER_HOME`, …); a refusal comes back as
 * a 400 carrying the reason, so it is worth surfacing verbatim.
 *
 * This is worth spelling out because the obvious alternative does not work: `profile.yaml`
 * is whitelisted on *read* to `description` + `description_auto`
 * (`computer_cli/profiles.py:read_profile_meta`), so a field invented there is written to
 * disk and then never read back by anything.
 *
 * All four 404 on a profile that does not exist, which is why nothing here is called before
 * the hire.
 */

/** One key, narrowed to what the two surfaces reading it actually use. */
export interface ProfileEnvKey {
  isSet: boolean
  /**
   * Hermes' own answer, not a guess from the name. Absent for a key it has never heard of,
   * which is why the field is optional at the call site.
   */
  isPassword: boolean
  /** The masked form Hermes computes. `null` for a key with no value on disk. */
  redactedValue: string | null
  description: string
  category: string
  /** "OpenRouter" — empty for anything the provider catalogue does not recognise. */
  providerLabel: string
  /** Tool names that read this key. */
  tools: string[]
  /** Owned by the dashboard's Channels page; not this app's to edit. */
  channelManaged: boolean
  /** In no catalogue — a key the user added to `.env` directly. */
  custom: boolean
}

export type ProfileEnv = Readonly<Record<string, ProfileEnvKey>>

export async function fetchProfileEnv(profile: string): Promise<ProfileEnv> {
  const rows = await request<HermesEnvResponse>(
    `/api/env?profile=${encodeURIComponent(profile)}`,
  )

  return Object.fromEntries(
    Object.entries(rows).map(([key, row]) => [
      key,
      {
        isSet: row?.is_set === true,
        isPassword: row?.is_password === true,
        redactedValue: row?.redacted_value ?? null,
        description: row?.description ?? '',
        category: row?.category ?? '',
        providerLabel: row?.provider_label ?? '',
        tools: row?.tools ?? [],
        channelManaged: row?.channel_managed === true,
        custom: row?.custom === true,
      },
    ]),
  )
}

export function setProfileEnvVar(
  profile: string,
  key: string,
  value: string,
): Promise<unknown> {
  return request('/api/env', {
    method: 'PUT',
    body: JSON.stringify({ key, value, profile }),
  })
}

/**
 * Remove a key from the employee's `.env`.
 *
 * Deliberately more than a line delete server-side: `remove_provider_env_credential` also
 * clears env-seeded `credential_pool` entries in `auth.json` and value-matched
 * `config.yaml` `api_key` mirrors, because a stale higher-precedence copy would otherwise
 * keep the provider alive in the model picker after the key was "removed". OAuth and
 * manually-added pool entries for the same provider survive.
 */
export function deleteProfileEnvVar(profile: string, key: string): Promise<unknown> {
  return request('/api/env', {
    method: 'DELETE',
    body: JSON.stringify({ key, profile }),
  })
}

/**
 * The real value of one key.
 *
 * Hermes gates this three ways — the session token is required outright, reveals are capped
 * at 5 per 30 seconds process-wide (a 429 past that), and each one is written to the server
 * log. That is the whole reason the value is not simply included in the listing.
 */
export async function revealProfileEnvVar(
  profile: string,
  key: string,
): Promise<string> {
  const data = await request<{ key: string; value: string }>('/api/env/reveal', {
    method: 'POST',
    body: JSON.stringify({ key, profile }),
  })
  return data.value
}
