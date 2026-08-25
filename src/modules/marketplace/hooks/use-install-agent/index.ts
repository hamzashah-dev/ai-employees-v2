import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { createProfile } from '@/modules/core/services/hermes/rest'
import type { CatalogAgent } from '../../constants/catalog'

/**
 * Hiring an agent is creating a Hermes profile named after it, seeded with the
 * catalog tagline as its description. There is no other install step: the
 * profile is the employee.
 *
 * Errors are left on the mutation rather than swallowed — Hermes answers a name
 * collision or a bad slug with a `detail` string worth reading, and the card
 * prints it.
 */
export function useInstallAgent(
  agent: CatalogAgent,
): UseMutationResult<unknown, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['install-agent', agent.id],
    mutationFn: () => createProfile({ name: agent.id, description: agent.tagline }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}
