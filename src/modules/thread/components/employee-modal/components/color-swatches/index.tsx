import type { FC } from 'react'
import { PlusIcon } from '@repo/icons/plus'
import { cn } from '@repo/ui/cn'
import { WithTooltip } from '@repo/ui/tooltip'
import {
  IDENTITY_COLORS,
  IDENTITY_COLOR_NAMES,
} from '@/modules/core/constants/identity'

interface ColorSwatchesProps {
  activeIndex: number
  onSelect: (index: number) => void
}

/**
 * The eleven employee hues.
 *
 * The fill is an inline style rather than a class because `IDENTITY_COLORS` is the bot's own
 * palette — the same values `BotGlyph` puts in an SVG `fill` and `BotAvatar` hands to a 3D
 * material. Writing them as arbitrary Tailwind colour values would be the banned thing;
 * reading them from the one constant that owns the palette is not.
 *
 * A radiogroup rather than eleven buttons: picking a colour is picking *one of* a set, and
 * arrow-key navigation between them comes free from the role.
 */
export const ColorSwatches: FC<ColorSwatchesProps> = ({ activeIndex, onSelect }) => (
  <div
    role="radiogroup"
    aria-label="Avatar colour"
    className="flex max-w-40 flex-wrap items-center gap-1.5"
  >
    {IDENTITY_COLORS.map((color, index) => (
      <button
        key={color}
        type="button"
        role="radio"
        aria-checked={index === activeIndex}
        aria-label={IDENTITY_COLOR_NAMES[index] ?? `Colour ${index + 1}`}
        onClick={() => onSelect(index)}
        style={{ backgroundColor: color }}
        className={cn(
          'size-5 shrink-0 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary',
          // The ring on the chosen swatch is `border-inverse`, the one ring colour with
          // enough contrast to read against all eleven hues in both themes.
          { 'ring-2 ring-inverse': index === activeIndex },
        )}
      />
    ))}

    {/*
      The canvas ends the row with a `+`. There is nothing behind it: the palette is the
      eleven bot hues and they are a local constant, not a Hermes field — see
      `stores/identity-store`. A live control leading to a colour picker that could not save
      anywhere would be worse than one that says so.
    */}
    <WithTooltip
      content="The palette is fixed to these eleven hues"
      size="sm"
      showArrow={false}
      className="inline-flex"
      tooltipContentProps={{ side: 'bottom', sideOffset: 6, className: 'max-w-56' }}
    >
      <button
        type="button"
        disabled
        aria-label="Add a colour — the palette is fixed to these eleven hues"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-secondary text-tertiary"
      >
        <PlusIcon className="size-3" />
      </button>
    </WithTooltip>
  </div>
)
