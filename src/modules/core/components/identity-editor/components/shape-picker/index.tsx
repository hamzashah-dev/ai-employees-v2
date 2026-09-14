import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { BotMark } from '@/modules/core/components/bot-avatar'
import { MASCOT_SHAPES, MASCOT_SHAPE_NAMES } from '@/modules/core/constants/identity'
import type { MascotShape } from '@/modules/core/utils/identity'

interface ShapePickerProps {
  shape: MascotShape
  /** The employee's current hue, so a choice previews as itself rather than as grey. */
  color: `#${string}`
  /** The employee's seed, so a choice previews as *this* character in the other shape. */
  seed: string
  onSelect: (shape: MascotShape) => void
}

/**
 * The nine silhouettes, drawn in the employee's own colour and from the employee's own seed.
 *
 * This is the whole of "change the avatar": there is no image upload behind it and there
 * could not be one — Hermes stores nothing per profile but text, and an avatar kept only in
 * this browser's localStorage as a data URL would be a large thing to lose silently. Nine
 * characters that survive a reload beat a photo that does not.
 *
 * Each option is the same `BotMark` the roster and the hero draw, at 24px — there is one
 * renderer now, so a preview cannot disagree with the thing it previews.
 */
export const ShapePicker: FC<ShapePickerProps> = ({ shape, color, seed, onSelect }) => (
  <div
    role="radiogroup"
    aria-label="Avatar shape"
    className="flex flex-wrap items-center gap-1"
  >
    {MASCOT_SHAPES.map((option) => (
      <button
        key={option}
        type="button"
        role="radio"
        aria-checked={option === shape}
        aria-label={MASCOT_SHAPE_NAMES[option]}
        onClick={() => onSelect(option)}
        className={cn(
          'flex size-9 items-center justify-center rounded-xl border border-transparent outline-none hover:bg-fill-variant-hover focus-visible:ring-2 focus-visible:ring-primary',
          { 'border-secondary bg-fill-variant-active': option === shape },
        )}
      >
        <BotMark
          shape={option}
          color={color}
          seed={seed}
          size={24}
          label={null}
          className="size-6"
        />
      </button>
    ))}
  </div>
)
