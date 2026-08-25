import type { FC } from 'react'
import { SearchIcon } from '@repo/icons/search'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

/**
 * The hero search bar. 640px on the canvas's 1200px column; it gives way rather
 * than overflowing on anything narrower, which the single artboard says nothing
 * about.
 *
 * The focus ring is drawn on the pill rather than the bare input so it traces the
 * shape you see. The canvas specifies no focus state at all — that is a gap in a
 * design that draws every control as a div, not a decision to copy.
 */
export const SearchField: FC<SearchFieldProps> = ({ value, onChange }) => (
  <label className="flex h-12 w-full max-w-[640px] items-center gap-2.5 rounded-3xl bg-fill px-5 shadow-xs focus-within:ring-2 focus-within:ring-brand">
    <span className="sr-only">Search agents</span>
    <SearchIcon className="size-5 shrink-0 text-tertiary" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search agents"
      autoComplete="off"
      spellCheck={false}
      className="min-w-0 flex-1 bg-transparent text-body-md text-primary outline-none placeholder:text-tertiary"
    />
  </label>
)
