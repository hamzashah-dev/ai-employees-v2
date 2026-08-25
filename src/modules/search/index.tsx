import type { FC, ReactNode } from 'react'
import { SearchIcon } from '@repo/icons/search'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui/dialog'
import { Spinner } from '@/modules/core/components/spinner'
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
 */
export const EmployeeSearchModal: FC = () => {
  const {
    isOpen,
    setOpen,
    query,
    setQuery,
    employees,
    messages,
    isSearching,
    isEmpty,
    select,
  } = useEmployeeSearch()

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
          {isSearching && <Spinner className="size-4 shrink-0 text-tertiary" />}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <Group title="Employees" rows={employees} query={query} onSelect={select} />
          <Group title="Messages" rows={messages} query={query} onSelect={select} />

          {isEmpty && <NoResults query={query.trim()} />}
          {!query.trim() && (
            <Note>
              Type to find an employee by name, or a line from any of their threads.
            </Note>
          )}
        </div>
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
      <h2 className="px-3 py-1.5 text-label-md font-medium text-tertiary">{title}</h2>
      {rows.map((row) => (
        <ResultRow key={row.key} row={row} query={query} onSelect={onSelect} />
      ))}
    </section>
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

const Note: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="px-6 py-12 text-center text-label-sm text-tertiary">{children}</p>
)
