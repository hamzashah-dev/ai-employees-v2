import { API_BASE, authHeaders } from '@/modules/core/services/hermes/config'
import { HermesHttpError } from '@/modules/core/services/hermes/rest'

/**
 * The per-employee key store — the only real one Hermes has.
 *
 * `GET /api/env?profile=<name>` answers a dict of every environment variable it
 * knows about for that profile, each row carrying `is_set` and `is_password`
 * (`computer_cli/web_server.py:7365`). `PUT /api/env` writes one, scoped by
 * `body.profile`, and lands it in that profile's own `.env`
 * (`_profile_scope` → `save_env_value` → `get_computer_home()/.env`). Arbitrary
 * names are accepted so long as they match `^[A-Za-z_][A-Za-z0-9_]*$` and are
 * not on the writer denylist (`PATH`, `LD_PRELOAD`, `COMPUTER_HOME`, …).
 *
 * This is worth spelling out because the obvious alternative does not work:
 * `profile.yaml` is whitelisted on *read* to `description` + `description_auto`
 * (`computer_cli/profiles.py:read_profile_meta`), so a field invented there is
 * written to disk and then never read back by anything.
 *
 * Both calls 404 on a profile that does not exist, which is why nothing here is
 * called before the hire.
 *
 * These two belong in `core/services/hermes/rest.ts` next to `createProfile`,
 * and should move there — they live in this module only because that file was
 * off-limits during the pass that added them.
 */

/** One row of `GET /api/env`, narrowed to the two fields this surface reads. */
export interface ProfileEnvKey {
  isSet: boolean
  /**
   * Hermes' own answer, not a guess from the name. Absent for a key it has
   * never heard of, which is why the field is optional at the call site.
   */
  isPassword: boolean
}

export type ProfileEnv = Readonly<Record<string, ProfileEnvKey>>

interface HermesEnvRow {
  is_set?: boolean
  is_password?: boolean
}

async function envRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(),
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
    throw new HermesHttpError(response.status, detail, path)
  }

  return (await response.json()) as T
}

export async function fetchProfileEnv(profile: string): Promise<ProfileEnv> {
  const rows = await envRequest<Record<string, HermesEnvRow>>(
    `/api/env?profile=${encodeURIComponent(profile)}`,
  )

  return Object.fromEntries(
    Object.entries(rows).map(([key, row]) => [
      key,
      { isSet: row?.is_set === true, isPassword: row?.is_password === true },
    ]),
  )
}

export function setProfileEnvVar(
  profile: string,
  key: string,
  value: string,
): Promise<unknown> {
  return envRequest('/api/env', {
    method: 'PUT',
    body: JSON.stringify({ key, value, profile }),
  })
}
