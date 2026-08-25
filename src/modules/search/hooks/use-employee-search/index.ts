import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchProfiles,
  fetchSidebarSessions,
  searchSessions,
} from '@/modules/core/services/hermes/rest'
import { useSearchStore } from '@/modules/core/stores/search-store'
import { formatRosterTime } from '@/modules/core/utils/time'
import { lastActivityByProfile, matchEmployees } from '../../utils/match-employees'
import { searchAcrossProfiles, type MessageHit } from '../../utils/search-across'

/**
 * Everything behind the D10 modal.
 *
 * The two groups are deliberately asymmetric. `Employees` is a local filter over
 * a roster that is already in the cache, so it answers on the keystroke.
 * `Messages` is a fan-out over one HTTP call per employee, so it waits for the
 * typing to stop first.
 */

/** Long enough that a burst of typing is one fan-out; short enough not to feel laggy. */
const DEBOUNCE_MS = 250

/**
 * Below two characters the fan-out is all cost and no signal — FTS5 prefix-matches
 * every token, so `a` matches most messages an employee has ever sent.
 */
const MIN_QUERY_LENGTH = 2

/**
 * Duplicated from `modules/roster/constants`, which a feature module may not
 * import. It wants promoting to `modules/core`; one line to delete here when it is.
 */
const EMPLOYEES_PATH = '/employees'

export interface SearchRow {
  key: string
  profile: string
  /** The line the row draws, with the query highlighted inside it. */
  text: string
  timeLabel: string
}

export interface UseEmployeeSearchResult {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  query: string
  setQuery: (query: string) => void
  employees: SearchRow[]
  messages: SearchRow[]
  /** True while the fan-out is running, including for a query still debouncing. */
  isSearching: boolean
  /** True once a query has been typed and neither group has anything to show. */
  isEmpty: boolean
  select: (profile: string) => void
}

export function useEmployeeSearch(): UseEmployeeSearchResult {
  const navigate = useNavigate()
  const isOpen = useSearchStore((state) => state.isOpen)
  const setOpen = useSearchStore((state) => state.setOpen)
  const open = useSearchStore((state) => state.open)

  const [query, setQuery] = useState('')
  const debounced = useDebounced(query.trim(), DEBOUNCE_MS)

  useKeyboardShortcut(open)

  // A modal that reopens holding the last search reads as stale, not as helpful.
  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  /*
   * Both of these share their query key with the sidebar's own `useRoster`, so on
   * every route where the sidebar is mounted — which is all of them — opening the
   * modal costs no request at all.
   */
  const profiles = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const sessions = useQuery({
    queryKey: ['sidebar-sessions'],
    queryFn: fetchSidebarSessions,
  })

  const names = useMemo(
    () => (profiles.data ?? []).map((profile) => profile.name),
    [profiles.data],
  )

  const trimmed = query.trim()
  const canSearch = isOpen && debounced.length >= MIN_QUERY_LENGTH && names.length > 0

  const hits = useQuery({
    queryKey: ['employee-search', debounced, names],
    queryFn: () => searchAcrossProfiles(names, debounced, searchSessions),
    enabled: canSearch,
    // Keeps the previous result on screen while the next one lands, so the list
    // does not blink empty between keystrokes.
    placeholderData: keepPreviousData,
  })

  const activity = useMemo(
    () => (sessions.data ? lastActivityByProfile(sessions.data) : new Map<string, number>()),
    [sessions.data],
  )

  const employees = useMemo<SearchRow[]>(
    () =>
      matchEmployees(profiles.data ?? [], query, activity).map((match) => ({
        key: match.profile,
        profile: match.profile,
        text: match.displayName,
        timeLabel: match.activityMs > 0 ? formatRosterTime(match.activityMs) : '',
      })),
    [profiles.data, query, activity],
  )

  // `placeholderData` deliberately holds the previous result across a keystroke,
  // which would also hold it after the query drops back under the threshold.
  const messages = useMemo<SearchRow[]>(
    () => (canSearch ? (hits.data ?? []).map(toRow) : []),
    [canSearch, hits.data],
  )

  const select = useCallback(
    (profile: string) => {
      setOpen(false)
      navigate(`${EMPLOYEES_PATH}/${encodeURIComponent(profile)}`)
    },
    [navigate, setOpen],
  )

  /*
   * Two separate waits, and conflating them is what makes a search box flash
   * "No results" at someone who is still typing: the debounce has not fired yet,
   * or it has and the fan-out is in flight. Either counts as searching.
   */
  const isSearching =
    trimmed.length > 0 &&
    ((trimmed.length >= MIN_QUERY_LENGTH && debounced !== trimmed) ||
      (canSearch && hits.isFetching) ||
      profiles.isPending)

  return {
    isOpen,
    setOpen,
    query,
    setQuery,
    employees,
    messages,
    isSearching,
    isEmpty:
      trimmed.length > 0 &&
      !isSearching &&
      employees.length === 0 &&
      messages.length === 0,
    select,
  }
}

/**
 * A hit's row line.
 *
 * `lineage_root` rather than `session_id` for the key: the handler dedupes by
 * compression lineage and returns the lineage *tip* as `session_id`, so the root
 * is the stable identity of the conversation. Both are optional on the wire, hence
 * the profile-plus-index fallback the caller cannot hit twice.
 */
function toRow(hit: MessageHit, index: number): SearchRow {
  return {
    key: `${hit.profile}:${hit.lineage_root ?? hit.session_id ?? index}`,
    profile: hit.profile,
    text: hit.snippet?.trim() || 'No preview',
    timeLabel: formatRosterTime(hit.session_started),
  }
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return settled
}

/**
 * Cmd/Ctrl+K, which is what imagine-computer-web already binds for search — its
 * sidebar sends the same chord to the chat history page
 * (`use-sidebar-body-content/index.ts`). Same chord, same intent, so the muscle
 * memory survives the port rather than colliding with it. Capture phase and
 * `stopPropagation` are copied from there too: without them the browser's own
 * find-in-page binding wins on some platforms.
 */
function useKeyboardShortcut(open: () => void): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key !== 'k' && event.key !== 'K') return
      event.preventDefault()
      event.stopPropagation()
      open()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])
}
