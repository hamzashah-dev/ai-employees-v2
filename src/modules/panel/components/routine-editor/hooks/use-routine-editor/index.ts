import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCronJob,
  deleteCronJob,
  updateCronJob,
} from '@/modules/core/services/hermes/rest'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { ROUTINES_QUERY_KEY } from '../../../../constants'
import {
  DEFAULT_CADENCE,
  fromCronExpression,
  toCronExpression,
  type Cadence,
} from '../../../../utils/cadence'
import { formatSchedule } from '@/modules/core/utils/format-schedule'
import { routineLabel } from '../../../../utils/routine-state'

/** A real value, not a placeholder — saving without touching it still makes sense. */
const NEW_ROUTINE_NAME = 'New routine'

export interface RoutineEditorState {
  name: string
  setName: (value: string) => void
  cadence: Cadence
  setCadence: (value: Cadence) => void
  prompt: string
  setPrompt: (value: string) => void
  /** The schedule read back through the routine row's own formatter. */
  preview: string
  /** Set once the user has tried to save something incomplete. */
  problem: string | null
  isSaving: boolean
  save: () => void
  /** Absent when creating — there is nothing to delete yet. */
  remove: {
    isConfirming: boolean
    isPending: boolean
    request: () => void
    cancel: () => void
    confirm: () => void
  } | null
}

/**
 * The routine form's state and its two writes.
 *
 * Every mutation invalidates the whole `['cron', …]` prefix rather than this
 * profile's key alone, because the same job also appears in the cross-employee
 * routines table under `['cron', 'all']` — a routine you renamed here would
 * otherwise keep its old name over there until a refetch happened to fire.
 */
export function useRoutineEditor(
  profile: string,
  job: HermesCronJob | null,
  onDone: () => void,
): RoutineEditorState {
  const queryClient = useQueryClient()

  const [name, setName] = useState(() => (job ? routineLabel(job) : NEW_ROUTINE_NAME))
  const [prompt, setPrompt] = useState(() => job?.prompt ?? '')
  const [cadence, setCadence] = useState<Cadence>(() =>
    job ? fromCronExpression(job.schedule) : DEFAULT_CADENCE,
  )
  const [problem, setProblem] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const schedule = useMemo(() => toCronExpression(cadence), [cadence])
  const preview = schedule ? formatSchedule(schedule) : 'Not a schedule yet'

  const settle = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [ROUTINES_QUERY_KEY] })
    onDone()
  }, [onDone, queryClient])

  const write = useMutation<HermesCronJob, Error, { name: string; schedule: string }>({
    mutationFn: (draft) =>
      job
        ? updateCronJob(job.id, { ...draft, prompt }, profile)
        : createCronJob({ ...draft, prompt }, profile),
    onError: (cause) => setProblem(cause.message || 'That routine did not save.'),
    onSuccess: settle,
  })

  const destroy = useMutation<unknown, Error, void>({
    mutationFn: () => deleteCronJob(job?.id ?? '', profile),
    onError: (cause) => {
      setIsConfirming(false)
      setProblem(cause.message || 'That routine was not deleted.')
    },
    onSuccess: settle,
  })

  const save = useCallback(() => {
    if (!prompt.trim()) {
      // Hermes rejects a job with no prompt, skill or script
      // (`_validate_dashboard_cron_effective_job`), and this app posts neither
      // of the other two — so the failure is knowable before the round trip.
      setProblem('Say what this routine should do.')
      return
    }
    if (!schedule) {
      setProblem(
        cadence.kind === 'custom'
          ? 'A custom schedule is a 5-field cron expression, like 0 8 * * 1-5.'
          : 'Pick a time for this routine.',
      )
      return
    }
    setProblem(null)
    write.mutate({ name: name.trim() || NEW_ROUTINE_NAME, schedule })
  }, [cadence.kind, name, prompt, schedule, write])

  return {
    name,
    setName,
    cadence,
    setCadence,
    prompt,
    setPrompt,
    preview,
    problem,
    isSaving: write.isPending,
    save,
    remove: job
      ? {
          isConfirming,
          isPending: destroy.isPending,
          request: () => setIsConfirming(true),
          cancel: () => setIsConfirming(false),
          confirm: () => destroy.mutate(),
        }
      : null,
  }
}
