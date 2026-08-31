import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchProfileEnv, type ProfileEnv } from '@/modules/core/services/hermes/rest'

/**
 * The cache entry for one employee's key store.
 *
 * Read by the marketplace's hire receipt, which counts an agent's required keys against it.
 *
 * Still in core rather than inside the marketplace: this is the PER-EMPLOYEE view of the key
 * store, and it survives only to answer "does this employee override a workspace key". The
 * roster-wide store is Settings › Vault, which reads the same endpoint with no `profile`
 * param (`fetchGlobalEnv`). The employee modal's Vaults page that used to share this entry
 * is gone — keys are held once, for the whole roster.
 */
export const profileEnvKey = (profile: string): [string, string] => [
  'profile-env',
  profile,
]

/**
 * `GET /api/env?profile=…`.
 *
 * `enabled` exists for the pre-hire case only: the endpoint 404s on a profile that does not
 * exist yet, and a 404 is not retried, so the marketplace holds the query back until the
 * profile has been created. Consumers of an employee that is already on the roster can leave
 * it alone.
 *
 * `staleTime` keeps opening and closing the modal off the network without hiding a write —
 * every mutation invalidates the key outright.
 */
export function useProfileEnv(
  profile: string,
  options: { enabled?: boolean } = {},
): UseQueryResult<ProfileEnv, Error> {
  return useQuery({
    queryKey: profileEnvKey(profile),
    queryFn: () => fetchProfileEnv(profile),
    enabled: options.enabled ?? true,
    staleTime: 10_000,
  })
}
