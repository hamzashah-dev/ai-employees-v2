import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { CATEGORIES, type MarketplaceCategory } from '../../constants/categories'

interface CategoryMenuProps {
  value: MarketplaceCategory
  onChange: (category: MarketplaceCategory) => void
}

/**
 * The fourteen categories, moved off the page and into a dropdown per the user's
 * reference. The wrapping chip row is gone.
 *
 * The trigger reads `Category` while nothing is chosen and the category's own
 * name once one is — the reference always says `Category`, but a filter you
 * cannot see the state of is a filter people forget is on, and this page is
 * being rebuilt precisely because it was hard to read.
 */
export const CategoryMenu: FC<CategoryMenuProps> = ({ value, onChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      size="md"
      className="w-auto shrink-0 gap-1.5 rounded-full text-secondary"
    >
      {value === 'All' ? 'Category' : value}
      <DropdownMenuIcon className="size-4" />
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      size="lg"
      className="max-h-[336px] w-[224px] overflow-y-auto bg-surface-elevated"
    >
      <DropdownMenuRadioGroup
        value={value}
        onValueChange={(next) => onChange(next as MarketplaceCategory)}
      >
        {CATEGORIES.map((category) => (
          <DropdownMenuRadioItem.Root
            key={category}
            value={category}
            size="md"
            className="cursor-pointer justify-start pr-8"
          >
            {category}
            <DropdownMenuRadioItem.End>
              <CheckIcon className="size-4 text-primary" />
            </DropdownMenuRadioItem.End>
          </DropdownMenuRadioItem.Root>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)
