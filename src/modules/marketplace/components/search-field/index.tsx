import type { FC } from 'react'
import { SearchIcon } from '@repo/icons/search'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

/**
 * The search box, as the user's reference draws it: a small pill on the control
 * row rather than the 640px hero bar this page used to open with. It shrinks
 * with the row on a narrow viewport instead of overflowing.
 *
 * The focus ring is drawn on the pill rather than the bare input so it traces
 * the shape you see. The visible placeholder is the reference's terse `Search`;
 * the accessible name stays the fuller "Search agents", because a screen-reader
 * user hearing "Search" on a page with a sidebar search has no idea which one
 * they are in.
 */
export const SearchField: FC<SearchFieldProps> = ({ value, onChange }) => (
  <label className="flex h-8 w-[168px] items-center gap-2 rounded-full bg-fill px-3 focus-within:ring-2 focus-within:ring-brand tablet:w-[200px]">
    <span className="sr-only">Search agents</span>
    <SearchIcon className="size-4 shrink-0 text-tertiary" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search"
      autoComplete="off"
      spellCheck={false}
      className="min-w-0 flex-1 bg-transparent text-label-md text-primary outline-none placeholder:text-tertiary"
    />
  </label>
)
