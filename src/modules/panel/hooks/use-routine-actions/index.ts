import { useState } from 'react'
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import {
  pauseCronJob,
  resumeCronJob,
  triggerCronJob,
} from '@/modules/core/services/hermes/rest'
import { ROUTINES_QUERY_KEY } from '../../constants'

type RoutineMutation = UseMutationResult<unknown, Error, void>

export interface RoutineActions {
  pause: RoutineMutation
  resume: RoutineMutation
  trigger: RoutineMutation
  /** The last failure, cleared when another action starts. */
  error: string | null
}

/**
 * Pause, resume and run-now for one routine.
 *
 * Scoped to a single job rather than the list so `isPending` disables only the
 * button that was pressed — a shared mutation would grey out every row.
 */
export function useRoutineActions(jobId: string, profile: string): RoutineActions {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const options = (
    call: (id: string, profileName: string) => Promise<unknown>,
  ): UseMutationOptions<unknown, Error, void> => ({
    mutationFn: () => call(jobId, profile),
    onMutate: () => {
      setError(null)
    },
    onError: (cause) => {
      setError(cause.message || 'That request did not go through.')
    },
    // Awaited, so the button stays disabled until the refreshed list arrives
    // rather than flicking back to a stale state for a frame.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ROUTINES_QUERY_KEY, profile] }),
  })

  const pause = useMutation<unknown, Error, void>(options(pauseCronJob))
  const resume = useMutation<unknown, Error, void>(options(resumeCronJob))
  const trigger = useMutation<unknown, Error, void>(options(triggerCronJob))

  return { pause, resume, trigger, error }
}
