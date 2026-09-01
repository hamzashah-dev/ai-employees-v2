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
 * The eight employee hues.
 *
 * The fill is an inline style rather than a class because `IDENTITY_COLORS` is the bot's own
 * palette — the same values `BotMark` puts in an SVG `fill`. Writing them as arbitrary
 * Tailwind colour values would be the banned thing; reading them from the one constant that
 * owns the palette is not.
 *
 * The chosen swatch is ringed with a two-step shadow — a gap in the tray's own colour, then
 * white — rather than an `outline`. A single ring drawn directly on the swatch edge
 * disappears into the palest hues; the dark gap gives it something to sit against at every
 * one. That mattered more when the palette carried Snow, but Slate still needs it.
 *
 * A radiogroup rather than eight buttons: picking a colour is picking *one of* a set, and
 * arrow-key navigation between them comes free from the role.
 */
export const ColorSwatches: FC<ColorSwatchesProps> = ({ activeIndex, onSelect }) => (
  <div
    role="radiogroup"
    aria-label="Avatar colour"
    className="flex flex-wrap items-center gap-2"
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
          'size-[22px] shrink-0 rounded-full outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          // `0 0 0 2px #171717, 0 0 0 4px #fff` from the canvas: a gap in the *card's*
          // colour, then white. `ring-offset` paints the gap, `ring` the white.
          { 'ring-2 ring-inverse ring-offset-2 ring-offset-surface': index === activeIndex },
        )}
      />
    ))}

    {/*
      The canvas ends the row with a `+`. There is nothing behind it: the palette is the
      eight bot hues and they are a local constant, not a Hermes field — see
      `stores/identity-store`. A live control leading to a colour picker that could not save
      anywhere would be worse than one that says so.
    */}
    <WithTooltip
      content="The palette is fixed to these eight hues"
      size="sm"
      showArrow={false}
      className="inline-flex"
      tooltipContentProps={{ side: 'bottom', sideOffset: 6, className: 'max-w-56' }}
    >
      <button
        type="button"
        disabled
        aria-label="Add a colour — the palette is fixed to these eight hues"
        className="flex size-[22px] shrink-0 items-center justify-center rounded-full border border-secondary-hover text-tertiary"
      >
        <PlusIcon className="size-3 stroke-[1.4px]" />
      </button>
    </WithTooltip>
  </div>
)
