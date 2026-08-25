import type { FC } from 'react'
import { SearchIcon } from '@/modules/core/components/icon'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

export const SearchField: FC<SearchFieldProps> = ({ value, onChange }) => (
  <label className="flex h-12 w-full max-w-[640px] items-center gap-3 rounded-[24px] border border-[rgb(var(--color-ink-2))] bg-[rgb(var(--color-ink-1))] px-5">
    <span className="sr-only">Search agents</span>
    <SearchIcon className="size-[18px] shrink-0 text-[rgb(var(--color-ink-7)/0.5)]" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search agents"
      autoComplete="off"
      spellCheck={false}
      // Radius matched to the pill so the global focus ring traces its shape
      // rather than boxing the bare input.
      className="h-9 min-w-0 flex-1 rounded-[24px] bg-transparent text-label-md text-[rgb(var(--color-ink-7))] placeholder:text-[rgb(var(--color-ink-7)/0.5)]"
    />
  </label>
)
