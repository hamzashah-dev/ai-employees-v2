import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import { SearchIcon } from '@repo/icons/search'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
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

type ResultTab = 'all' | 'employees' | 'messages'

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
  const hasResults = !isResting && !isSearching && !isEmpty

  const [tab, setTab] = useState<ResultTab>('all')
  // A tab held from the previous query reads as a filter nobody chose — reset
  // it the moment the box goes back to resting, same as the query itself.
  useEffect(() => {
    if (isResting) setTab('all')
  }, [isResting])

  // Messages are searched one thread (employee) at a time, so "in N threads" is a
  // distinct count over the hits rather than the hit count itself.
  const threadCount = useMemo(
    () => new Set(messages.map((row) => row.profile)).size,
    [messages],
  )
  const resultCount = employees.length + messages.length

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="top-[12%] flex max-h-[70dvh] w-[calc(100vw-2rem)] max-w-[640px] translate-y-0 flex-col gap-0 overflow-hidden rounded-[20px] border-secondary bg-surface p-0 shadow-lg">
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
          {hasResults && (
            <Badge size="md" variant="neutral-subtle" className="shrink-0">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
              {threadCount > 0 &&
                ` in ${threadCount} ${threadCount === 1 ? 'thread' : 'threads'}`}
            </Badge>
          )}
        </div>

        {!isResting && (employees.length > 0 || messages.length > 0 || isSearching) && (
          <div className="flex h-[45px] shrink-0 items-center gap-1.5 border-b border-primary px-3 py-2">
            <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
              All
            </TabButton>
            <TabButton active={tab === 'employees'} onClick={() => setTab('employees')}>
              Employees
            </TabButton>
            <TabButton active={tab === 'messages'} onClick={() => setTab('messages')}>
              Messages
            </TabButton>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isResting ? (
            <Group title="Recent" rows={recent} query="" onSelect={select} />
          ) : (
            <>
              {tab !== 'messages' && (
                <Group title="Employees" rows={employees} query={query} onSelect={select} />
              )}

              {/*
                Placeholders, not an empty section. The heading is the promise that this
                group is coming; dropping it until the hits land makes the list jump under
                the cursor at the exact moment someone is reading it.
              */}
              {tab !== 'employees' &&
                (isSearching && messages.length === 0 ? (
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
                ))}

              {isEmpty && <NoResults query={trimmed} />}
            </>
          )}
        </div>

        <Footer
          isResting={isResting}
          isSearching={isSearching}
          isEmpty={isEmpty}
          hasResults={hasResults}
          searchedCount={searchedCount}
        />
      </DialogContent>
    </Dialog>
  )
}

/** One pill in the results filter row — matches the canvas's `bg-border-secondary` active state. */
const TabButton: FC<{ active: boolean; onClick: () => void; children: ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'flex h-7 items-center rounded-full px-3 text-label-sm transition-colors duration-200 ease-linear',
      active
        ? 'bg-fill-variant-active font-medium text-primary'
        : 'text-secondary hover:text-primary',
    )}
  >
    {children}
  </button>
)

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
  hasResults: boolean
  searchedCount: number
}> = ({ isResting, isSearching, isEmpty, hasResults, searchedCount }) => {
  const employeeWord = searchedCount === 1 ? 'employee' : 'employees'

  // Once there is something on screen to move through, the canvas swaps the running
  // commentary for the keyboard hints that actually apply to it — a row can be
  // arrowed to and opened, and every row opens the employee, never the message.
  if (hasResults) {
    return (
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-primary px-3.5">
        <div className="flex items-center gap-3">
          <KeyHint keys={['↑', '↓']} label="Move" />
          <KeyHint keys={['↵']} label="Open thread" />
          <KeyHint keys={['esc']} label="Close" />
        </div>
        <p className="shrink-0 text-label-sm text-tertiary">Opens the employee, not the message</p>
      </div>
    )
  }

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

/** One `key · label` pair in the results footer, e.g. `↑ ↓ Move`. */
const KeyHint: FC<{ keys: string[]; label: string }> = ({ keys, label }) => (
  <span className="flex items-center gap-1.5 text-label-sm text-tertiary">
    <span className="flex items-center gap-1">
      {keys.map((key) => (
        <span
          key={key}
          className="flex h-4 min-w-4 items-center justify-center rounded border border-tertiary px-1 text-label-xs text-tertiary"
        >
          {key}
        </span>
      ))}
    </span>
    {label}
  </span>
)

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
