import type { HermesCronJob } from '@/modules/core/services/hermes/types'

/**
 * Hermes writes a routine's pause state twice — `enabled: false` in storage and
 * a derived `state: "paused"` on read — and older records carry only one of
 * them. Treat either as paused, and treat an absent flag as running, which is
 * what `_normalize_job_record` assumes.
 */
export function isRoutinePaused(job: HermesCronJob): boolean {
  if (job.paused === true) return true
  return job.enabled === false
}

/** A routine's display name, falling back to its id when the record has none. */
export function routineLabel(job: HermesCronJob): string {
  const name = job.name?.trim()
  return name && name.length > 0 ? name : job.id
}
