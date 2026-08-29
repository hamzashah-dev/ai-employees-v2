import type { ProfileEnv } from '@/modules/core/services/hermes/rest'

export interface VaultKeyRow {
  name: string
  /** The masked form Hermes computes — never the real value. */
  masked: string
  /** "OpenRouter", "Tool credential", "Added by hand" — where the key came from. */
  origin: string
  /** Tool names that read this key, already truncated by the caller if long. */
  tools: string[]
  isPassword: boolean
  /**
   * Owned by the Hermes dashboard's Channels page. Listed read-only rather than hidden,
   * because a credential the employee holds is a credential the employee holds — but editing
   * it here would fight the richer configuration UI that owns it.
   */
  channelManaged: boolean
}

/** What the origin line says, in descending order of how specific Hermes can be. */
function describeOrigin(key: ProfileEnv[string]): string {
  if (key.providerLabel) return key.providerLabel
  if (key.custom) return 'Added by hand'
  switch (key.category) {
    case 'provider':
      return 'Model provider'
    case 'tool':
      return 'Tool credential'
    case 'skill':
      return 'Skill credential'
    case 'messaging':
      return 'Messaging channel'
    case 'setting':
      return 'Setting'
    default:
      return 'Credential'
  }
}

/**
 * The credentials this employee actually holds, alphabetically.
 *
 * **The filter is the whole point.** `GET /api/env` answers the entire catalogue — 295 rows
 * on a stock install, of which two were set — so listing the payload unfiltered would claim
 * the employee has access to hundreds of services it has no key for. `is_set` is the only
 * field that distinguishes a key on disk from a key Hermes merely knows the name of.
 *
 * Sorted by name rather than by category: with a handful of rows a grouping is noise, and a
 * stable alphabetical order means a newly added key does not reshuffle the list.
 */
export function toVaultKeys(env: ProfileEnv | undefined): VaultKeyRow[] {
  if (!env) return []

  return Object.entries(env)
    .filter(([, key]) => key.isSet)
    .map(([name, key]) => ({
      name,
      masked: key.redactedValue ?? '••••',
      origin: describeOrigin(key),
      tools: key.tools,
      isPassword: key.isPassword,
      channelManaged: key.channelManaged,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Hermes' own rule for an environment-variable name, mirrored so a bad name is caught before
 * the round trip: `save_env_value` rejects anything not matching `^[A-Za-z_][A-Za-z0-9_]*$`.
 *
 * The *denylist* (`PATH`, `LD_PRELOAD`, `COMPUTER_HOME`, …) is deliberately not mirrored —
 * it lives in one place server-side and a copy here would drift. A denied name comes back as
 * a 400 carrying the reason, which the form shows verbatim.
 */
export function isValidKeyName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)
}
