import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import type { EmployeeStatus } from '@/modules/core/types/chat'

export interface EmployeeStateLine {
  label: string
  /** Which token fills the status dot. Named rather than a class so this stays testable. */
  tone: 'success' | 'warning' | 'critical' | 'neutral'
}

/**
 * The state line under the employee's name.
 *
 * Derived from the socket this app already holds, which is the only place a live state
 * exists: Hermes has no per-profile status endpoint, and `gateway_running` on
 * `GET /api/profiles` reports whether a *gateway process* is up, not whether the employee
 * is doing anything.
 *
 * A closed socket is therefore reported as unknown rather than as "Ready". The store keeps
 * the last status it saw for the life of the tab, so without this the modal would keep
 * claiming an employee is working long after the connection that said so went away.
 */
export function describeEmployeeState(
  status: EmployeeStatus | undefined,
  connection: ConnectionState,
): EmployeeStateLine {
  if (connection !== 'open') {
    return { label: 'Status unknown', tone: 'neutral' }
  }

  switch (status) {
    case 'working':
      return { label: 'Working', tone: 'success' }
    case 'needs-you':
      return { label: 'Needs you', tone: 'warning' }
    case 'error':
      return { label: 'Something went wrong', tone: 'critical' }
    default:
      return { label: 'Ready', tone: 'neutral' }
  }
}
