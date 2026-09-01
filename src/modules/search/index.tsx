import type { FC, ReactNode } from 'react'
import { SearchIcon } from '@repo/icons/search'
import { Badge } from '@repo/ui/badge'
import { Skeleton } from '@repo/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui/dialog'
import { SEARCH_SHORTCUT_LABEL } from '@/modules/core/constants/shortcuts'
import { ResultRow } from './components/result-row'
import { useEmployeeSearch, type SearchRow } from './hooks/use-employee-search'

/**
 * D10 — search across the team, over whatever is behind it.
 *
 * Mounted once in the shell rather than on a route, because the thing that opens
 * it is the sidebar's `Search` row and the sidebar outlives every route. It reads
 * `modules/core/stores/search-store` for that reason: the trigger and the surface
 * are in two different feature modules, which may not import each other.
 *
 * Positioned near the top rather than centred, overriding `DialogContent`'s own
 * `top-1/2`. A palette that grows downwards keeps the input under the cursor as
 * results arrive; a centred one walks the input up the screen on every keystroke.
 *
 * Three states, and the footer names each one:
 *
 * - **Resting** — the roster, newest first, so the modal is useful before a
 *   keystroke. Not "recent searches": nothing records those, and inventing them
 *   would be a fiction.
 * - **Searching** — employees answer immediately (a local filter over a cached
 *   roster) while messages are still out at one HTTP call per employee. The
 *   asymmetry is drawn rather than hidden: the answered group is listed, the
 *   pending one is placeholders, and the footer says how many threads are out.
 * - **Nothing found** — which names what each group looked at, because only one of
 *   them reached the backend. Someone searching a phrase they know they wrote
 *   needs to know it was really searched.
 */
export const EmployeeSearchModal: FC = () => {
  const {
    isOpen,
    setOpen,
    query,
    setQuery,
    recent,
    employees,
    messages,
    searchedCount,
    isSearching,
    isEmpty,
    select,
  } = useEmployeeSearch()

  const trimmed = query.trim()
  const isResting = trimmed.length === 0

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="top-[12%] flex max-h-[70dvh] w-[calc(100vw-2rem)] max-w-[640px] translate-y-0 flex-col gap-0 overflow-hidden rounded-[20px] border-primary bg-surface-elevated p-0 shadow-lg">
        <DialogTitle className="sr-only">Search your team</DialogTitle>
        <DialogDescription className="sr-only">
          Find an employee by name, or a message in any employee’s thread.
        </DialogDescription>

        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-primary px-4">
          <SearchIcon className="size-4 shrink-0 stroke-[1.2px] text-tertiary" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search employees and messages"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search employees and messages"
            className="min-w-0 flex-1 bg-transparent text-body-md text-primary outline-none placeholder:text-tertiary"
          />
          {/*
            A worded state rather than a spinner. The wait is the *messages* fan-out
            specifically — the employees beside it have already answered — and a bare
            spinner in the corner of a box that is showing results reads as though the
            whole list were provisional.
          */}
          {isSearching && (
            <span className="flex shrink-0 items-center gap-1.5 text-label-sm text-tertiary">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-fill-success" />
              Searching threads
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isResting ? (
            <Group title="Recent" rows={recent} query="" onSelect={select} />
          ) : (
            <>
              <Group title="Employees" rows={employees} query={query} onSelect={select} />

              {/*
                Placeholders, not an empty section. The heading is the promise that this
                group is coming; dropping it until the hits land makes the list jump under
                the cursor at the exact moment someone is reading it.
              */}
              {isSearching && messages.length === 0 ? (
                <section className="pb-1" aria-busy>
                  <GroupHeading>Messages</GroupHeading>
                  <div className="flex flex-col gap-3 px-3 py-3">
                    <Skeleton className="h-3 w-[70%] bg-fill-elevated" />
                    <Skeleton className="h-3 w-[42%] bg-fill-elevated" />
                    <Skeleton className="h-3 w-[55%] bg-fill-elevated" />
                  </div>
                </section>
              ) : (
                <Group title="Messages" rows={messages} query={query} onSelect={select} />
              )}

              {isEmpty && <NoResults query={trimmed} />}
            </>
          )}
        </div>

        <Footer
          isResting={isResting}
          isSearching={isSearching}
          isEmpty={isEmpty}
          searchedCount={searchedCount}
        />
      </DialogContent>
    </Dialog>
  )
}

/**
 * A heading with nothing under it reads as a broken section, so an empty group is
 * absent rather than empty — the same rule the dashboard's `Needs a yes` band follows.
 */
const Group: FC<{
  title: string
  rows: SearchRow[]
  query: string
  onSelect: (profile: string) => void
}> = ({ title, rows, query, onSelect }) => {
  if (rows.length === 0) return null

  return (
    <section className="pb-1">
      <GroupHeading>{title}</GroupHeading>
      {rows.map((row) => (
        <ResultRow key={row.key} row={row} query={query} onSelect={onSelect} />
      ))}
    </section>
  )
}

const GroupHeading: FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="px-3 py-1.5 text-label-md font-medium text-tertiary">{children}</h2>
)

/**
 * The strip along the bottom, which says what the modal is doing.
 *
 * It carries the counts because the two groups are not searched the same way: employees
 * are a local name filter, messages are one request per employee. "Searched 5 employees ·
 * 0 matches" is the difference between "we looked and there is nothing" and "we never
 * asked", and only the footer is in a position to say which.
 */
const Footer: FC<{
  isResting: boolean
  isSearching: boolean
  isEmpty: boolean
  searchedCount: number
}> = ({ isResting, isSearching, isEmpty, searchedCount }) => {
  const employeeWord = searchedCount === 1 ? 'employee' : 'employees'

  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-t border-primary px-4">
      <p className="min-w-0 truncate text-label-sm text-tertiary">
        {isResting
          ? 'Type a name, or a line from any thread'
          : isSearching
            ? `Searching ${searchedCount} ${employeeWord}’ thread history`
            : isEmpty
              ? `Searched ${searchedCount} ${employeeWord} · 0 matches`
              : `Searched ${searchedCount} ${employeeWord}`}
      </p>
      {isResting && (
        <Badge size="md" variant="neutral-subtle" className="shrink-0">
          {SEARCH_SHORTCUT_LABEL}
        </Badge>
      )}
    </div>
  )
}

/**
 * The no-results state (drawn as an annotated inset on the canvas).
 *
 * It names *what* was searched, because the two groups look for different things
 * and only one of them reached the backend — a user who searched a phrase they
 * know they wrote should be able to tell that messages were genuinely searched.
 */
const NoResults: FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
    <p className="text-label-md text-primary">No results for “{query}”</p>
    <p className="max-w-[360px] text-label-sm text-tertiary">
      Employees match on name. Messages search every employee’s thread history.
    </p>
  </div>
)
