import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { CursorIcon } from '@repo/icons/cursor-icon'
import { cn } from '@repo/ui/cn'

/**
 * A drawing of the employee's screen — deliberately static.
 *
 * The canvas paints a skeleton here rather than a feed because there is no
 * screen stream to show: Hermes exposes no such endpoint, so anything moving
 * would be invented. It stays a drawing until there is a real feed to render,
 * which is why nothing here is wired to data.
 *
 * `#3D3D3D` is `border-tertiary` in the design. This token layer only reaches
 * that neutral as a *fill* through the elevated ramp's active step, hence
 * `bg-fill-elevated-active` on the traffic lights.
 */

/** [width, fill] per bar, exactly as the canvas lays them out. */
const RAIL_BARS = [
  ['w-[70%]', 'bg-fill-elevated-hover'],
  ['w-[90%]', 'bg-fill-elevated'],
  ['w-[60%]', 'bg-fill-elevated'],
  ['w-[80%]', 'bg-fill-elevated'],
  ['w-[65%]', 'bg-fill-elevated'],
] as const

const MAIN_BARS = [
  ['w-[90%]', 'bg-fill-elevated'],
  ['w-[85%]', 'bg-fill-elevated'],
  ['w-[70%]', 'bg-fill-elevated-hover'],
  ['w-[88%]', 'bg-fill-elevated'],
  ['w-[62%]', 'bg-fill-elevated'],
  ['w-[75%]', 'bg-fill-elevated-hover'],
] as const

/** `className` carries the maximized height; the drawing itself does not change. */
export const ScreenPreview: FC<PropsWithClassName> = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      'relative h-[280px] w-full shrink-0 overflow-hidden rounded-2xl border border-primary bg-fill',
      className,
    )}
  >
    <div className="flex h-6 items-center gap-1 bg-fill-elevated px-2.5">
      <span className="size-[5px] rounded-full bg-fill-elevated-active" />
      <span className="size-[5px] rounded-full bg-fill-elevated-active" />
      <span className="size-[5px] rounded-full bg-fill-elevated-active" />
      <span className="ml-2 h-2.5 w-[40%] rounded-[5px] bg-fill-elevated-hover" />
    </div>

    <div className="flex h-full">
      <div className="flex w-[90px] flex-col gap-2 border-r border-primary p-2.5">
        {RAIL_BARS.map(([width, fill]) => (
          <span key={width} className={cn('h-1.5 rounded-[3px]', width, fill)} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <span className="h-2 w-[45%] rounded-[4px] bg-fill-elevated-hover" />
        {MAIN_BARS.map(([width, fill]) => (
          <span key={width} className={cn('h-1.5 rounded-[3px]', width, fill)} />
        ))}
      </div>
    </div>

    <CursorIcon className="absolute left-[58%] top-[52%] size-4 text-primary" />
  </div>
)
