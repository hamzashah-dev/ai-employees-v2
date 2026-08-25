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

export interface ThinkingDisclosureProps
  extends PropsWithChildren,
    PropsWithClassName {
  /** Unique accordion value (e.g. derived from the message id). */
  value: string
  /** Header label — shimmers while active, static summary once done. */
  label: ReactNode
  /** Whether the model is currently working (drives the shimmer). */
  isActive: boolean
  labelClassName?: string
  /**
   * Rendered after the collapsible body and always visible, even when folded. Receives
   * the open state so it can, e.g., draw a rail connector only while the body above it
   * is expanded.
   */
  renderFooter?: (isOpen: boolean) => ReactNode
}

/**
 * The borderless master collapsible for thinking surfaces.
 *
 * It stays **closed by default, including while streaming** — a pane that unfolds itself
 * mid-answer shoves the text the reader is following down the page. The live signal is
 * the shimmering header plus whatever `renderFooter` draws, which sits outside
 * `AccordionContent` so it survives the fold.
 */
export const ThinkingDisclosure: FC<ThinkingDisclosureProps> = ({
  value,
  label,
  isActive,
  labelClassName,
  className,
  children,
  renderFooter,
}) => {
  const [openValue, setOpenValue] = useState('')
  const isOpen = openValue === value

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
        <AccordionTrigger className="group/trigger flex w-fit flex-none cursor-pointer items-center gap-2 py-1 hover:bg-transparent">
          <span
            className={cn(
              'text-label-md text-tertiary',
              { 'animate-shimmer bg-clip-text text-transparent': isActive },
              labelClassName,
            )}
          >
            {label}
          </span>
          <AccordionTriggerIcon className="transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
            <ChevronDownIcon className="size-3 stroke-[1.5] text-tertiary" />
          </AccordionTriggerIcon>
        </AccordionTrigger>

        <AccordionContent className="pt-0 pb-0">
          <div className="flex flex-col gap-2">{children}</div>
        </AccordionContent>
      </AccordionItem>

      {renderFooter?.(isOpen)}
    </Accordion>
  )
}
