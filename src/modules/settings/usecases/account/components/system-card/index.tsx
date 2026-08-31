import type { FC, ReactNode } from 'react'
import { ExternalLinkIcon } from '@repo/icons/external-link-icon'
import { Skeleton } from '@repo/ui/skeleton'
import { cn } from '@repo/ui/cn'

interface SystemCardProps {
  isLoading: boolean
  /** Set only when `/api/status` itself failed. */
  errorMessage?: string
  version?: string
  gatewayRunning?: boolean
  overall?: string
  computerHome?: string
  employeeCount?: number
  disk?: { totalMb: number; freeMb: number }
}

/**
 * The machine every employee runs on, entirely from `GET /api/status`.
 *
 * Three deliberate departures from the canvas, each because the endpoint cannot answer it:
 *
 * - **No host OS row.** The canvas draws "macOS 15.3 · arm64"; `/api/status` carries no
 *   host, OS, release or architecture field of any kind. (`GET /api/system/stats` does, but
 *   it is a different endpoint that the app's Hermes client does not wrap — so this is a row
 *   to *add* with that call, never one to infer from the browser's user agent, which
 *   describes the viewer's machine and not the install's.)
 * - **No uptime.** The canvas says "Connected · up 4d 6h". Nothing in the payload dates the
 *   gateway's start: `gateway_updated_at` is a state-file write time, not a boot time, and
 *   is not in the client's `HermesStatus` either. The badge says connected or not, full stop.
 * - **No group count.** The canvas says "7 employees · 2 groups". Groups are local browser
 *   state in this app, and Settings has no access to that store; a number here would either
 *   be wrong or would make this card depend on another feature module.
 *
 * The disk row also reads "N GB free of M GB" rather than the canvas' "1.8 GB used · 42.1 GB
 * free". `collect_disk_status` is one `shutil.disk_usage` against the *filesystem*
 * COMPUTER_HOME sits on, so `total − free` is everything on that volume — the OS included —
 * and printing it beside the word "workspace" would read as the workspace's own footprint.
 */
export const SystemCard: FC<SystemCardProps> = ({
  isLoading,
  errorMessage,
  version,
  gatewayRunning,
  overall,
  computerHome,
  employeeCount,
  disk,
}) => {
  if (isLoading) {
    return (
      <div role="status" aria-label="Loading the system card" className="flex gap-3">
        <Skeleton className="h-24 flex-1 rounded-2xl bg-fill-elevated" />
        <Skeleton className="h-24 flex-1 rounded-2xl bg-fill-elevated" />
      </div>
    )
  }

  if (errorMessage !== undefined) {
    return (
      <p role="alert" className="text-label-md text-critical">
        {errorMessage}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 tablet:flex-row">
        <dl className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-primary p-3">
          <Row label="Hermes">{version ?? <Unreported />}</Row>
          <Row label="Gateway">
            {gatewayRunning === undefined ? (
              <Unreported />
            ) : (
              <span
                className={cn('flex items-center gap-1 text-label-sm', {
                  'text-success': gatewayRunning,
                  'text-critical': !gatewayRunning,
                })}
              >
                <span
                  aria-hidden="true"
                  className={cn('size-1.5 rounded-full', {
                    'bg-fill-success': gatewayRunning,
                    'bg-fill-critical': !gatewayRunning,
                  })}
                />
                {gatewayRunning ? 'Running' : 'Not running'}
              </span>
            )}
          </Row>
          <Row label="Health">
            {/* `overall` is `ok` only when the gateway, dashboard, storage and platform
                rollups all are. Anything else is `degraded`, and the endpoint does not say
                which component — so the word is reported, not expanded into a guess. */}
            {overall === undefined ? (
              <Unreported />
            ) : (
              <span
                className={cn('text-label-sm', {
                  'text-success': overall === 'ok',
                  'text-warning': overall !== 'ok',
                })}
              >
                {overall === 'ok' ? 'All components ok' : 'Degraded'}
              </span>
            )}
          </Row>
        </dl>

        <dl className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-primary p-3">
          <Row label="Employees">
            {employeeCount === undefined ? <Unreported /> : describeEmployees(employeeCount)}
          </Row>
          <Row label="Workspace disk">
            {disk === undefined ? (
              <Unreported />
            ) : (
              `${formatGb(disk.freeMb)} free of ${formatGb(disk.totalMb)}`
            )}
          </Row>
        </dl>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 font-mono text-label-xs break-all text-tertiary">
          COMPUTER_HOME · {computerHome ?? 'not reported'}
        </span>

        {/*
         * Relative on purpose. The app is same-origin with Hermes — `API_BASE` is `''`
         * because the dashboard serves this bundle in production — and `/api/status` carries
         * no port or public URL to build an absolute link from. In `npm run dev` Vite serves
         * the app and proxies only `/api`, so this lands on the app itself; the honest fix
         * there is `VITE_HERMES_URL`, not a fabricated href.
         */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 text-label-sm text-brand hover:text-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          Open Hermes dashboard
          <ExternalLinkIcon className="size-3 stroke-[1.4px]" />
        </a>
      </div>
    </div>
  )
}

const Row: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2">
    <dt className="text-label-xs text-tertiary">{label}</dt>
    <dd className="min-w-0 truncate text-label-sm text-primary">{children}</dd>
  </div>
)

/**
 * What a field that `/api/status` left out looks like.
 *
 * Every field on `HermesStatus` is optional, and several are absent rather than empty on an
 * older backend or a failed sub-probe. Blank cells would read as zero.
 */
const Unreported: FC = () => <span className="text-tertiary">Not reported</span>

/** Whole MB to GB at 1024, matching the backend's own floor division into MB. */
export const formatGb = (mb: number): string => `${(mb / 1_024).toFixed(1)} GB`

export const describeEmployees = (count: number): string =>
  `${count} ${count === 1 ? 'employee' : 'employees'}`
