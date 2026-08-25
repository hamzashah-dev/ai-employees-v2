import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { SettingsSliderIcon } from '@repo/icons/settings-slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { SORT_OPTIONS, type AgentSortId } from '../../constants/sort'

interface SortMenuProps {
  value: AgentSortId
  onChange: (sort: AgentSortId) => void
}

/**
 * D16's sort control, in the icon-button shape the user's reference puts on the
 * control row: 20px radius on the menu (`size="lg"`), `bg-surface-elevated`,
 * `border-primary`, the four §6 orders with the active one carrying a check.
 *
 * `SettingsSliderIcon` is a substitution and worth knowing about: `@repo/icons`
 * ships no sort-descending glyph. The nearest by name, `ArrowDownAZIcon`, draws
 * an explicit A→Z and would state one of the four orders on a control that
 * offers all four — worse than a generic adjust glyph. The button carries a real
 * accessible name so the meaning is never left to the picture.
 *
 * Radio items rather than plain menu items: the check *is* the selected state,
 * and `menuitemradio` + `aria-checked` says so to a screen reader instead of
 * leaving a decorative glyph to carry it. Radix renders the indicator only for
 * the selected value, so nothing is conditioned by hand.
 */
export const SortMenu: FC<SortMenuProps> = ({ value, onChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      size="icon-md"
      aria-label="Sort agents"
      className="w-auto shrink-0 justify-center rounded-full text-secondary"
    >
      <SettingsSliderIcon className="size-4" />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" size="lg" className="w-[212px] bg-surface-elevated">
      <DropdownMenuRadioGroup
        value={value}
        onValueChange={(next) => onChange(next as AgentSortId)}
      >
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuRadioItem.Root
            key={option.id}
            value={option.id}
            size="md"
            className="cursor-pointer justify-start pr-8"
          >
            {option.label}
            <DropdownMenuRadioItem.End>
              <CheckIcon className="size-4 text-primary" />
            </DropdownMenuRadioItem.End>
          </DropdownMenuRadioItem.Root>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)
