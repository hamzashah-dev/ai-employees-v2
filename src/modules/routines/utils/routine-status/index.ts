import type { HermesCronJob } from '@/modules/core/services/hermes/types'

/**
 * What a routine's status pill says, derived from the record rather than chosen.
 *
 * Every one of these is a real field. `state` is normalised on read to
 * `scheduled | paused | running | done`; `enabled: false` is how a pause is
 * actually stored, and older hand-edited records carry only one of the two;
 * `last_status` is `success` or `error` on the last completed run and is absent
 * before the first. Nothing here is decoration.
 *
 * Order matters: a paused routine whose last run failed is paused — the pill
 * says what will happen next, and for that one nothing will.
 */

export type RoutineStatus = 'paused' | 'running' | 'failed' | 'active'

export const STATUS_LABELS: Record<RoutineStatus, string> = {
  paused: 'Paused',
  running: 'Running',
  failed: 'Failed',
  active: 'Active',
}

/**
 * Hermes writes a routine's pause state twice — `enabled: false` in storage and
 * a derived `state: "paused"` on read. Treat either as paused, and an absent
 * flag as running, which is what `_normalize_job_record` assumes.
 *
 * ponytail: duplicated from `modules/panel/utils/routine-state`. A feature
 * module may not import another feature's internals, and `modules/core` is not
 * this pass's to edit — promote both to `core/utils` when it is.
 */
export function isRoutinePaused(job: HermesCronJob): boolean {
  if (job.paused === true) return true
  if (job.state === 'paused') return true
  return job.enabled === false
}

export function routineStatus(job: HermesCronJob): RoutineStatus {
  if (isRoutinePaused(job)) return 'paused'
  if (job.state === 'running') return 'running'
  if (job.last_status === 'error') return 'failed'
  return 'active'
}

/** A routine's display name, falling back to its id when the record has none. */
export function routineLabel(job: HermesCronJob): string {
  const name = job.name?.trim()
  return name && name.length > 0 ? name : job.id
}

/** The employee that owns a routine. `profile` and `profile_name` are both set
 *  by `_annotate_cron_job`, but only on an `all` listing. */
export function routineProfile(job: HermesCronJob): string {
  return job.profile?.trim() || job.profile_name?.trim() || ''
}
