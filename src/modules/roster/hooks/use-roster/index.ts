import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProfiles, fetchSidebarSessions } from '@/modules/core/services/hermes/rest'
import { useIdentityStore } from '@/modules/core/stores/identity-store'
import type { HermesProfile, HermesSessionRow } from '@/modules/core/services/hermes/types'
import type { IdentityOverride } from '@/modules/core/types/identity'
import { identityKey, toDisplayName } from '@/modules/core/utils/identity'
import { formatRosterTime, toDate } from '@/modules/core/utils/time'
import { SESSIONS_REFETCH_MS } from '../../constants'
import type { RosterEntry } from '../../types'

/**
 * The sidebar's data.
 *
 * Two queries, deliberately independent: the roster is the profiles call, and
 * the last-outcome lines are one batched sessions call shared by every row. A
 * sessions failure therefore costs subtitles, not the roster — only a profiles
 * failure is an error the user has to act on.
 */

type SidebarSessions = Awaited<ReturnType<typeof fetchSidebarSessions>>

export interface UseRosterResult {
  entries: RosterEntry[]
  isLoading: boolean
  /** Set only when the roster itself could not be loaded. */
  errorMessage?: string
  retry: () => void
}

export function useRoster(): UseRosterResult {
  const profiles = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const sessions = useQuery({
    queryKey: ['sidebar-sessions'],
    queryFn: fetchSidebarSessions,
    refetchInterval: SESSIONS_REFETCH_MS,
  })

  const { refetch: refetchProfiles } = profiles
  const { refetch: refetchSessions } = sessions

  const retry = useCallback(() => {
    void refetchProfiles()
    void refetchSessions()
  }, [refetchProfiles, refetchSessions])

  /*
   * A rename is local presentation state (see `stores/identity-store`), but it has to
   * reach the sidebar on the same commit as the edit — and it reorders the list too,
   * because ties are broken alphabetically on the *displayed* name.
   */
  const overrides = useIdentityStore((state) => state.overrides)

  const entries = useMemo(
    () => buildEntries(profiles.data ?? [], sessions.data, overrides),
    [profiles.data, sessions.data, overrides],
  )

  return {
    entries,
    isLoading: profiles.isPending,
    errorMessage: profiles.isError ? describeError(profiles.error) : undefined,
    retry,
  }
}

/**
 * `last_active` is the recency column; `started_at` only says when the thread
 * opened, which for a long-running employee can be days off.
 */
function sessionStamp(row: HermesSessionRow): string | number | null | undefined {
  return row.last_active ?? row.ended_at ?? row.started_at
}

function firstText(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function buildEntries(
  profiles: HermesProfile[],
  sessions: SidebarSessions | undefined,
  overrides: Record<string, IdentityOverride>,
): RosterEntry[] {
  const latest = new Map<string, { row: HermesSessionRow; ms: number }>()

  // Cron and messaging runs are outcomes too — a routine that finished at 6am
  // is the newest thing that employee did, and omitting those lists would show
  // a stale chat preview instead.
  const rows = sessions
    ? [...sessions.recents, ...sessions.cron, ...sessions.messaging]
    : []

  for (const row of rows) {
    const profile = row.profile?.trim()
    if (!profile) continue
    const ms = toDate(sessionStamp(row))?.getTime() ?? 0
    const current = latest.get(profile)
    if (!current || ms > current.ms) latest.set(profile, { row, ms })
  }

  return profiles
    .map((profile): RosterEntry => {
      const match = latest.get(profile.name)
      const date = match && match.ms > 0 ? new Date(match.ms) : null

      return {
        profile: profile.name,
        displayName: toDisplayName(profile.name, overrides[identityKey(profile.name)]),
        subtitle: firstText(
          match?.row.preview,
          match?.row.title,
          profile.description,
          'No conversations yet',
        ),
        timeLabel: date ? formatRosterTime(match?.ms) : '',
        timeIso: date?.toISOString(),
        activityMs: match?.ms ?? 0,
      }
    })
    .sort(
      (a, b) =>
        b.activityMs - a.activityMs || a.displayName.localeCompare(b.displayName),
    )
}

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message.trim() : ''
  return message || 'Could not load your team.'
}
