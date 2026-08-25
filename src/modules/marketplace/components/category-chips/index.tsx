import type { FC } from 'react'
import { cn } from '@/modules/core/utils/cn'
import { CATEGORIES, type MarketplaceCategory } from '../../constants/categories'

interface CategoryChipsProps {
  value: MarketplaceCategory
  onChange: (category: MarketplaceCategory) => void
}

export const CategoryChips: FC<CategoryChipsProps> = ({ value, onChange }) => (
  <div
    role="group"
    aria-label="Filter agents by category"
    className="scrollbar-subtle flex gap-2 overflow-x-auto pb-2"
  >
    {CATEGORIES.map((category) => {
      const selected = category === value
      return (
        <button
          key={category}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(category)}
          className={cn(
            'h-8 shrink-0 rounded-full px-3.5 text-label-sm whitespace-nowrap',
            selected
              ? 'bg-[rgb(var(--color-ink-3))] text-[rgb(var(--color-ink-7))]'
              : 'bg-[rgb(var(--color-ink-1))] text-[rgb(var(--color-ink-7)/0.5)] hover:text-[rgb(var(--color-ink-7))]',
          )}
        >
          {category}
        </button>
      )
    })}
  </div>
)
