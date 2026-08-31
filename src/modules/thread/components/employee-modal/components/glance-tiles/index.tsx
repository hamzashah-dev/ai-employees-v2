import type { FC } from 'react'
import { ArrowTopRightIcon } from '@repo/icons/arrow-top-right-icon'
import { cn } from '@repo/ui/cn'
import type { EmployeeModalPage } from '../../types'

export interface GlanceTile {
  /** Where the tile goes. `info` means the tile states something already on this page. */
  page: EmployeeModalPage
  label: string
  /** The answer, in one short phrase. Never a number alone. */
  value: string
  note: string
  /** Model ids are read character by character, so they get the mono face. */
  mono?: boolean
}

interface GlanceTilesProps {
  tiles: GlanceTile[]
  onSelect: (page: EmployeeModalPage) => void
}

/**
 * The tiles that make Info worth landing on.
 *
 * Before these, Info held an avatar, a name and a model, and three-quarters of the card was
 * empty while Files and Connectors each hid behind a click — so the only way to learn that
 * both were empty was to open both. Each tile states what the page behind it holds, which
 * turns the landing page into a summary rather than a lobby.
 *
 * They are buttons, not links: this is a dialog, and navigating out of it would lose the
 * thread behind it. The arrow is the standing hint that the tile goes somewhere.
 */
export const GlanceTiles: FC<GlanceTilesProps> = ({ tiles, onSelect }) => (
  <div className="grid grid-cols-2 gap-2.5">
    {tiles.map((tile) => (
      <button
        key={tile.label}
        type="button"
        /*
         * Spelled out rather than left to the three spans: adjacent JSX elements have no
         * whitespace between them, so the computed name came out as "Connectors1 of 2
         * ongithub". A label is also the only place the relationship between the three
         * lines can be stated — sighted readers get it from the layout.
         */
        aria-label={`${tile.label}: ${tile.value}. ${tile.note}`}
        onClick={() => onSelect(tile.page)}
        className="flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-primary bg-fill-elevated px-4 py-3.5 text-left outline-none transition-colors hover:border-secondary-hover focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-label-xs text-tertiary uppercase">{tile.label}</span>
          <ArrowTopRightIcon className="size-3 shrink-0 text-tertiary" />
        </span>
        <span
          className={cn('truncate text-label-lg text-primary', { 'font-mono': tile.mono })}
        >
          {tile.value}
        </span>
        <span className="truncate text-label-sm text-tertiary">{tile.note}</span>
      </button>
    ))}
  </div>
)
