import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { installProfile } from '@/modules/core/services/hermes/rest'
import type { CatalogAgent } from '../../constants/catalog'

/**
 * Where the backend finds an agent's pack — a path, not a URL, resolved relative
 * to the cloud-computer checkout that serves `/api/*`. Every id in
 * `AVAILABLE_AGENT_IDS` has a directory there.
 */
const packSource = (id: string): string => `agents/${id}`

/**
 * Hire an agent by installing its distribution pack.
 *
 * `POST /api/profiles/install` copies the pack's `SOUL.md`, `config.yaml`,
 * `profile.yaml`, `skills/`, `cron/`, `hooks/` and `checks/` into the profile and
 * seeds the bundled skills, so identity, model, tool gating and schedule come
 * from `agents/<id>/` rather than from this client.
 *
 * `force` is not passed: hiring twice reports the collision instead of
 * overwriting a profile in use. A missing or malformed pack returns a 400 whose
 * `detail` the card prints.
 */
export function useInstallAgent(
  agent: CatalogAgent,
): UseMutationResult<unknown, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['install-agent', agent.id],
    mutationFn: () => installProfile({ source: packSource(agent.id) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}
