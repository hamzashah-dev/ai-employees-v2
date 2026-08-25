import type { PropsWithClassName } from '@repo/types/common'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { ChevronDownIcon } from '@repo/icons/chevron-down'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionTriggerIcon,
} from '@repo/ui/accordion'
import { cn } from '@repo/ui/cn'
import { useState } from 'react'
import { ThinkingGuide } from '../thinking-guide'

export interface ThinkingTrailItemProps
  extends PropsWithChildren,
    PropsWithClassName {
  /** Unique accordion value for this row. */
  value: string
  label: ReactNode
  /** The node marker shown on the rail (icon, emoji, dot, …). */
  marker?: ReactNode
  /** Shimmers the label while this step is running. */
  isActive?: boolean
  /** Draws a connector up to the previous row so the rail stays continuous. */
  connectTop?: boolean
  labelClassName?: string
}

/**
 * One node in the thinking timeline: a marker sitting on the rail + label, with an
 * optional collapsible body indented behind a {@link ThinkingGuide}. Without children
 * it degrades to a plain row rather than an accordion with nothing to open, so a tool
 * call with no detail does not get a dead chevron.
 *
 * The trigger hugs its content (`w-fit`) so the chevron sits beside the label instead of
 * being pushed to the far edge by the base accordion's `justify-between`.
 */
export const ThinkingTrailItem: FC<ThinkingTrailItemProps> = ({
  value,
  label,
  marker,
  isActive = false,
  connectTop = false,
  labelClassName,
  className,
  children,
}) => {
  const [openValue, setOpenValue] = useState('')

  const markerNode = (
    <span className="relative flex size-4 shrink-0 items-center justify-center text-secondary">
      {connectTop && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-[calc(100%+4px)] mx-auto h-2 w-px bg-fill-tertiary"
        />
      )}
      {marker}
    </span>
  )

  const labelNode = (
    <span
      className={cn(
        'truncate text-label-md text-secondary',
        { 'animate-shimmer bg-clip-text text-transparent': isActive },
        labelClassName,
      )}
    >
      {label}
    </span>
  )

  if (!children) {
    return (
      <div className={cn('flex w-fit items-center gap-3 py-0.5 pl-1.5', className)}>
        {markerNode}
        {labelNode}
      </div>
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openValue}
      onValueChange={setOpenValue}
      className={cn('w-full', className)}
    >
      <AccordionItem
        value={value}
        className="my-0 rounded-none border-0 bg-transparent p-0"
      >
        <AccordionTrigger className="group/item flex w-fit flex-none cursor-pointer items-center gap-2 py-0.5 pl-1.5 hover:bg-transparent">
          <span className="flex items-center gap-3">
            {markerNode}
            {labelNode}
          </span>
          <AccordionTriggerIcon className="ml-0.5 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
            <ChevronDownIcon className="size-3 stroke-[1.5] text-tertiary" />
          </AccordionTriggerIcon>
        </AccordionTrigger>

        <AccordionContent className="pt-1 pb-0">
          <ThinkingGuide>{children}</ThinkingGuide>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
