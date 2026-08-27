import { useCallback, useMemo } from 'react'
import { useIdentityStore } from '../../stores/identity-store'
import type { IdentityOverride } from '../../types/identity'
import {
  getIdentity,
  identityKey,
  toDisplayName,
  type EmployeeIdentity,
} from '../../utils/identity'

/**
 * Reading the identity override the way a component should: subscribed.
 *
 * The pure helpers in `utils/identity` cannot subscribe to anything, so a component that
 * called them directly would keep drawing the old face until something else re-rendered it.
 * Renaming an employee in the info modal has to reach the sidebar row and the thread header
 * on the same commit, which is what these hooks are for.
 */

export function useIdentityOverride(profile: string): IdentityOverride | undefined {
  return useIdentityStore((state) => state.overrides[identityKey(profile)])
}

export function useEmployeeIdentity(profile: string): EmployeeIdentity {
  const override = useIdentityOverride(profile)
  return useMemo(() => getIdentity(profile, override), [profile, override])
}

export function useDisplayName(profile: string): string {
  const override = useIdentityOverride(profile)
  return toDisplayName(profile, override)
}

/**
 * One subscription for a list of employees.
 *
 * A table that names a dozen profiles cannot call `useDisplayName` per row, and splitting
 * every such row into its own component only to hold one hook is worse than this.
 */
export function useDisplayNameResolver(): (profile: string) => string {
  const overrides = useIdentityStore((state) => state.overrides)
  return useCallback(
    (profile: string) => toDisplayName(profile, overrides[identityKey(profile)]),
    [overrides],
  )
}
