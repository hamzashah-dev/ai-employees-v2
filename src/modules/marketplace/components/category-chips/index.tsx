import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { CATEGORIES, type MarketplaceCategory } from '../../constants/categories'

interface CategoryChipsProps {
  value: MarketplaceCategory
  onChange: (category: MarketplaceCategory) => void
}

/**
 * Fourteen chips that wrap onto as many rows as they need, capped at 920px so the
 * AI Market link keeps its place at the end of the filter row.
 */
export const CategoryChips: FC<CategoryChipsProps> = ({ value, onChange }) => (
  <div
    role="group"
    aria-label="Filter agents by category"
    className="flex max-w-[920px] flex-wrap gap-1.5"
  >
    {CATEGORIES.map((category) => (
      <button
        key={category}
        type="button"
        aria-pressed={category === value}
        onClick={() => onChange(category)}
        className={cn(
          'flex h-8 cursor-pointer items-center rounded-xl border border-secondary px-3 text-label-md whitespace-nowrap text-secondary',
          { 'bg-fill-elevated text-primary': category === value },
        )}
      >
        {category}
      </button>
    ))}
  </div>
)
