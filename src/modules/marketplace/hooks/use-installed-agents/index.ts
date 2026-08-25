import { useQuery } from '@tanstack/react-query'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'

const NONE: ReadonlySet<string> = new Set()

/**
 * The ids already on the roster, lowercased for comparison.
 *
 * A profile *is* the installed agent — Hermes keeps no install record — so the
 * roster is read straight from `/api/profiles`. If that call fails the set is
 * empty rather than an error state: the shelf still browses, and Install stays
 * offered. Installing something already present fails loudly server-side with a
 * name collision, which the card surfaces, so a wrong guess here is recoverable.
 */
export function useInstalledAgents(): ReadonlySet<string> {
  const { data } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    select: (profiles) =>
      new Set(profiles.map((profile) => profile.name.trim().toLowerCase())),
    staleTime: 30_000,
  })

  return data ?? NONE
}
