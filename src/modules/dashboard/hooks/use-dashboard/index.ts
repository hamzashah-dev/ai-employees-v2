import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useRoster } from '@/modules/roster/hooks/use-roster'
import {
  dayPeriod,
  deriveSections,
  PERIOD_GREETING,
  summariseDay,
  type DashboardSections,
} from '../../utils/derive-sections'

export interface DashboardData {
  /** "Morning" / "Afternoon" / "Evening", from the reader's own clock. */
  greeting: string
  summary: string
  sections: DashboardSections
  isLoading: boolean
  /** The roster loaded and is genuinely empty — D5, not a failure. */
  isEmpty: boolean
  /** Set only when the roster itself could not be loaded. */
  errorMessage?: string
  retry: () => void
}

/**
 * The dashboard's data: the roster, plus whatever the socket knows right now.
 *
 * Nothing is fetched for this screen alone — both queries are the ones the
 * sidebar already runs, so opening the dashboard costs no request.
 */
export function useDashboard(): DashboardData {
  const { entries, isLoading, errorMessage, retry } = useRoster()
  const threads = useChatStore((state) => state.threads)

  /*
   * Same query key as useRoster's, so this reads its cache rather than issuing
   * a second call. Read separately because `description` is the only per-profile
   * prose Hermes has and useRoster folds it into a subtitle *behind* the session
   * preview — by the time it is a RosterEntry the description is usually gone.
   */
  const { data: profiles } = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })

  const roles = useMemo(
    () =>
      Object.fromEntries(
        (profiles ?? []).map((profile) => [profile.name, profile.description?.trim() ?? '']),
      ),
    [profiles],
  )

  const period = dayPeriod(new Date().getHours())

  // `Date.now()` is deliberately not a dependency: it only decides which day
  // counts as "today", and re-bucketing on every tick would be pointless work.
  const sections = useMemo(
    () => deriveSections({ entries, threads, roles, nowMs: Date.now() }),
    [entries, threads, roles],
  )

  return {
    greeting: PERIOD_GREETING[period],
    summary: summariseDay(sections, period),
    sections,
    isLoading,
    isEmpty: !isLoading && !errorMessage && sections.team.length === 0,
    errorMessage,
    retry,
  }
}
