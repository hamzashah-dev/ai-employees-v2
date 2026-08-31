import { useState, type FC, type FormEvent } from 'react'
import { MoreHorizontalIcon } from '@repo/icons/more-horizontal'
import { PlusIcon } from '@repo/icons/plus'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { Skeleton } from '@repo/ui/skeleton'
import { Spinner } from '@/modules/core/components/spinner'

/**
 * Hand-rolled because `@repo/ui` ships no text field. Same class list as the employee
 * modal's vault form, widened to a textarea: a memory is a sentence, sometimes two, and a
 * single-line input hides the end of it while you type.
 */
const FIELD =
  'w-full min-w-0 resize-y rounded-xl border border-secondary bg-fill px-2.5 py-2 text-label-md text-primary placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:text-disabled'

/** The 28px square the row's manage control sits in, matching the design's `#i-more` slot. */
const ICON_BUTTON =
  'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-secondary outline-none transition-colors hover:bg-fill-variant-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:text-disabled'

interface MemoryListProps {
  entries: readonly string[]
  isLoading: boolean
  /** Set only when MEMORY.md itself could not be read. */
  errorMessage?: string
  /** Hermes' refusal on the last save, verbatim. */
  writeError?: string
  isSaving: boolean
  /** Each resolves `true` once the file holds the change; see `useAccountSettings`. */
  onAdd: (content: string) => Promise<boolean>
  onUpdate: (index: number, content: string) => Promise<boolean>
  onRemove: (index: number) => Promise<boolean>
  onDismissWriteError: () => void
}

/**
 * The memories every employee reads, and the three edits that change them.
 *
 * **No byline.** The canvas prints "Written by Chief of Staff · 3 days ago" under each
 * entry; nothing anywhere stores that. `memories/MEMORY.md` is a flat list of entry strings
 * joined by `§` (`tools/memory_tool.py`) with no author, no timestamp and no sidecar that
 * carries either — `GET /api/memory/file` answers `{content, path, exists}` and `GET
 * /api/memory` only adds the file's byte size. An attribution line here would have to be
 * invented per entry, so the row is the memory and nothing else.
 *
 * Row order is the file's order, and the index *is* the identity — there is no per-entry id
 * to hold onto. So a form closes as soon as its save lands, but not before: a refused write
 * (a 500 from an unwritable `memories/`) keeps the editor and the typed text, because the
 * whole-document PUT has changed nothing and discarding the text would lose the only copy.
 */
export const MemoryList: FC<MemoryListProps> = ({
  entries,
  isLoading,
  errorMessage,
  writeError,
  isSaving,
  onAdd,
  onUpdate,
  onRemove,
  onDismissWriteError,
}) => {
  const [adding, setAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number>()

  const isSettled = !isLoading && errorMessage === undefined

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex h-6 items-center justify-between gap-2">
        <h3 className="text-label-sm text-secondary">
          Memory · what every employee knows about you
          {isSettled && ` · ${entries.length}`}
        </h3>

        <Button
          type="button"
          variant="link-accent"
          size="xs"
          disabled={isLoading || errorMessage !== undefined}
          onClick={() => {
            onDismissWriteError()
            setEditingIndex(undefined)
            setAdding((open) => !open)
          }}
          className="gap-1"
        >
          {adding ? null : <PlusIcon className="size-3 stroke-[1.4px]" />}
          {adding ? 'Cancel' : 'Add memory'}
        </Button>
      </div>

      {isLoading && (
        <div role="status" aria-label="Loading memories" className="flex flex-col gap-2 py-2">
          <Skeleton className="h-4 w-2/3 bg-fill-elevated" />
          <Skeleton className="h-4 w-1/2 bg-fill-elevated" />
        </div>
      )}

      {errorMessage !== undefined && (
        <p role="alert" className="py-2 text-label-md text-critical">
          {errorMessage}
        </p>
      )}

      {writeError !== undefined && (
        <p role="alert" className="py-2 text-label-sm text-critical">
          {writeError}
        </p>
      )}

      {adding && (
        <MemoryForm
          label="Add a memory"
          isSaving={isSaving}
          onCancel={() => setAdding(false)}
          onSubmit={(content) => {
            void onAdd(content).then((saved) => {
              if (saved) setAdding(false)
            })
          }}
        />
      )}

      {isSettled && entries.length === 0 && !adding && (
        <p className="py-2 text-label-md text-tertiary">
          No memories yet. Employees write these themselves as they learn something worth
          keeping, and anything added here is read by all of them.
        </p>
      )}

      <ul className="flex flex-col">
        {entries.map((entry, index) => (
          <li
            // The file has no ids, so the entry text is the only stable key available.
            // `MemoryStore.load_from_disk` de-duplicates entries, so it is unique in
            // practice; the index disambiguates a duplicate that reached the file another way.
            key={`${index}-${entry}`}
            className="flex flex-col gap-2 border-b border-primary py-2"
          >
            <div className="flex items-start gap-3">
              <span className="min-w-0 flex-1 text-label-md break-words text-primary">
                {entry}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Manage memory ${index + 1}`}
                  className={ICON_BUTTON}
                >
                  <MoreHorizontalIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="flex w-44 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
                >
                  <DropdownMenuItem
                    onSelect={() => {
                      onDismissWriteError()
                      setAdding(false)
                      setEditingIndex(index)
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      onDismissWriteError()
                      void onRemove(index)
                    }}
                    className="text-critical"
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {editingIndex === index && (
              <MemoryForm
                label={`Edit memory ${index + 1}`}
                initial={entry}
                isSaving={isSaving}
                onCancel={() => setEditingIndex(undefined)}
                onSubmit={(content) => {
                  void onUpdate(index, content).then((saved) => {
                    if (saved) setEditingIndex(undefined)
                  })
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface MemoryFormProps {
  /** The form's accessible name, and the textarea's. */
  label: string
  initial?: string
  isSaving: boolean
  onSubmit: (content: string) => void
  onCancel: () => void
}

const MemoryForm: FC<MemoryFormProps> = ({
  label,
  initial,
  isSaving,
  onSubmit,
  onCancel,
}) => {
  const [draft, setDraft] = useState(initial ?? '')

  /*
   * Trimmed, because `MemoryStore._parse_entries` strips every entry on read: an entry that
   * is only whitespace parses back to nothing, so saving one would silently drop it.
   */
  const canSubmit = draft.trim().length > 0 && draft.trim() !== initial?.trim()

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(draft.trim())
  }

  return (
    <form
      onSubmit={submit}
      aria-label={label}
      className="flex flex-col gap-2 rounded-2xl border border-primary bg-fill-elevated px-4 py-3.5"
    >
      <textarea
        autoFocus
        rows={2}
        aria-label={label}
        placeholder="One thing every employee should know about you"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className={cn(FIELD, 'min-h-16')}
      />

      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="xs" disabled={!canSubmit || isSaving}>
          {isSaving ? <Spinner /> : null}
          Save
        </Button>
      </div>
    </form>
  )
}
