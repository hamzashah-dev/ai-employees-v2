import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { toDisplayName } from '@/modules/core/utils/identity'
import { ROUTES } from '@/modules/roster/constants'
import { formatCadence } from '../../utils/format-cadence'
import { formatRelativeTime } from '../../utils/relative-time'
import {
  routineLabel,
  routineProfile,
  routineStatus,
  STATUS_LABELS,
  type RoutineStatus,
} from '../../utils/routine-status'

const STATUS_VARIANT: Record<
  RoutineStatus,
  'neutral-subtle' | 'neutral-strong' | 'critical' | 'success'
> = {
  paused: 'neutral-subtle',
  running: 'neutral-strong',
  failed: 'critical',
  active: 'success',
}

/**
 * Every routine on the roster, one row each.
 *
 * 56px rows on a 1px `border-primary` hairline and no zebra fill, per the
 * canvas — the table primitive's own `border-secondary` is overridden for that
 * and nothing else.
 */
export const RoutinesTable: FC<{ jobs: HermesCronJob[] }> = ({ jobs }) => (
  <Table containerClassName="rounded-2xl border border-primary">
    <TableHeader>
      <TableRow className="border-primary hover:bg-transparent">
        <TableHead className="px-4">Employee</TableHead>
        <TableHead>Routine</TableHead>
        <TableHead>Cadence</TableHead>
        <TableHead>Last run</TableHead>
        <TableHead>Next run</TableHead>
        <TableHead className="px-4">Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {jobs.map((job) => (
        <Row key={`${routineProfile(job)}:${job.id}`} job={job} />
      ))}
    </TableBody>
  </Table>
)

const Row: FC<{ job: HermesCronJob }> = ({ job }) => {
  const profile = routineProfile(job)
  const status = routineStatus(job)
  const paused = status === 'paused'
  const failed = job.last_status === 'error'

  return (
    <TableRow
      className={cn('h-14 border-primary', {
        // A paused routine is still listed, but it is not going to do anything.
        'text-tertiary': paused,
      })}
    >
      <TableCell className="px-4">
        {profile ? (
          <Link
            to={`${ROUTES.EMPLOYEES}/${profile}`}
            className="flex items-center gap-2.5 rounded-lg text-label-md text-inherit hover:text-primary"
          >
            <EmployeeAvatar profile={profile} className="size-7 shrink-0" />
            <span className="truncate">{toDisplayName(profile)}</span>
          </Link>
        ) : (
          // `profile` is injected by the dashboard's `all` listing; a record
          // without one cannot be attributed, and guessing would be worse.
          <span className="text-label-md text-tertiary">Unknown employee</span>
        )}
      </TableCell>

      <TableCell className="text-label-md">{routineLabel(job)}</TableCell>

      <TableCell className="text-label-md">{formatCadence(job)}</TableCell>

      <TableCell
        className={cn('text-label-md', {
          'text-critical': failed && !paused,
        })}
      >
        {formatRelativeTime(job.last_run_at)}
        {failed && <span className="sr-only"> — failed</span>}
      </TableCell>

      <TableCell className="text-label-md">
        {paused ? 'Paused' : formatRelativeTime(job.next_run_at)}
      </TableCell>

      <TableCell className="px-4">
        <Badge variant={STATUS_VARIANT[status]} size="md">
          {STATUS_LABELS[status]}
        </Badge>
      </TableCell>
    </TableRow>
  )
}
