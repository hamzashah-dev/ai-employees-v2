import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'

/**
 * Everyone who could sit in a room.
 *
 * Shares the roster's `['profiles']` query key on purpose: the sidebar has almost
 * always fetched this already by the time a picker opens, so the list is there on
 * the first frame instead of after a spinner. It also means a hire shows up in both
 * places on the same invalidation.
 */
export interface GroupCandidate {
  name: string
  /**
   * The profile's one-line description. Hermes has no *role* field — this is
   * whatever `profile.yaml` carries, which is often nothing, and the pickers
   * render nothing rather than inventing a job title for someone.
   */
  title?: string
}

export interface UseGroupCandidatesResult {
  candidates: GroupCandidate[]
  isLoading: boolean
  error: string | null
}

export function useGroupCandidates(): UseGroupCandidatesResult {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

  const candidates = useMemo(
    () =>
      (data ?? []).map((profile) => ({
        name: profile.name,
        ...(profile.description ? { title: profile.description } : {}),
      })),
    [data],
  )

  return {
    candidates,
    isLoading: isPending,
    error: isError
      ? (error instanceof Error && error.message) || 'Could not load your team.'
      : null,
  }
}
