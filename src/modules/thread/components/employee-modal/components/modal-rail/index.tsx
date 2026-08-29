import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { MODAL_PAGES, RAIL_ROW_CLASSES } from '../../constants'
import type { EmployeeModalPage } from '../../types'

interface ModalRailProps {
  active: EmployeeModalPage
  onSelect: (page: EmployeeModalPage) => void
  /**
   * How many rows each page has, once its query has answered. A page whose count is
   * `undefined` — still loading, or failed — shows no number rather than a `0` that would
   * read as an answer.
   */
  counts: Partial<Record<EmployeeModalPage, number>>
}

/**
 * The card's left rail: four destinations, one selected.
 *
 * Icon-only below `tablet:` (768px), where the dialog itself is near the viewport width and
 * a 176px rail would leave the pane too narrow to read a file name. The label is hidden with
 * `sr-only` rather than unmounted, so it is in the accessible name at every width and the
 * collapsed rail needs no tooltip.
 *
 * A nav rather than a tablist, and deliberately: the reference card is a list of
 * destinations, and `aria-current` describes that honestly. `role="tablist"` would promise
 * roving arrow-key focus that four plain buttons do not implement.
 *
 * The counts are `aria-hidden`. Each page states its own count in its heading, where it can
 * say what is being counted; a bare number appended to the button's name could not.
 */
export const ModalRail: FC<ModalRailProps> = ({ active, onSelect, counts }) => (
  <nav aria-label="Employee card" className="flex flex-col gap-0.5">
    {MODAL_PAGES.map(({ id, label, icon: Icon }) => {
      const isActive = id === active
      const count = counts[id]

      return (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
          onClick={() => onSelect(id)}
          className={cn(RAIL_ROW_CLASSES, 'max-tablet:justify-center', {
            'bg-fill-variant-active': isActive,
          })}
        >
          <span
            className={cn('flex min-w-0 items-center gap-2.5', {
              'text-primary': isActive,
              'text-secondary': !isActive,
            })}
          >
            <Icon className="size-4 shrink-0 stroke-[1.2px]" />
            <span className="sr-only truncate text-label-md tablet:not-sr-only">{label}</span>
          </span>

          {count !== undefined && (
            <span
              aria-hidden
              className="hidden shrink-0 text-label-xs text-tertiary tablet:inline"
            >
              {count}
            </span>
          )}
        </button>
      )
    })}
  </nav>
)
