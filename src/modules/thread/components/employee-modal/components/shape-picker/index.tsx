import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { BotGlyph } from '@/modules/core/components/bot-avatar'
import { MASCOT_SHAPES, MASCOT_SHAPE_NAMES } from '@/modules/core/constants/identity'
import type { MascotShape } from '@/modules/core/utils/identity'

interface ShapePickerProps {
  shape: MascotShape
  /** The employee's current hue, so a choice previews as itself rather than as grey. */
  color: `#${string}`
  onSelect: (shape: MascotShape) => void
}

/**
 * The eight silhouettes, drawn flat and in the employee's own colour.
 *
 * This is the whole of "change the avatar": there is no image upload behind it and there
 * could not be one — Hermes stores nothing per profile but text, and an avatar kept only in
 * this browser's localStorage as a data URL would be a large thing to lose silently. Eight
 * characters that survive a reload beat a photo that does not.
 *
 * Flat previews rather than eight live 3D bots: each one would be its own WebGL context, and
 * the modal already spends one on the hero above. `BotGlyph` is the same shape and the same
 * face, which is what makes the preview honest.
 */
export const ShapePicker: FC<ShapePickerProps> = ({ shape, color, onSelect }) => (
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
        <BotGlyph shape={option} color={color} label={null} className="size-6" />
      </button>
    ))}
  </div>
)
