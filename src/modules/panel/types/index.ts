/**
 * Shapes the panel has to read defensively.
 *
 * `HermesCronJob.schedule` is typed `string`, but the dashboard hands back the
 * raw job record from `cron/jobs.py`, where a stored schedule is an object —
 * `{kind: "cron", expr, display}`, `{kind: "interval", minutes, display}` or
 * `{kind: "once", run_at, display}`. Formatting therefore accepts `unknown` and
 * narrows here rather than trusting the wire type and printing "[object Object]".
 */
export interface CronScheduleObject {
  kind?: string
  expr?: string
  display?: string
  value?: string
  run_at?: string
  minutes?: number
}
