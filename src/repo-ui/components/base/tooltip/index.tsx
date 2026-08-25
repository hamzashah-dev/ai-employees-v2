import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { WithTooltipProps } from './types';
import type { TooltipContentVariantsProps } from './utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@repo/ui/cn';
import { tooltipContentVariants } from './utils';
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipArrow = TooltipPrimitive.Arrow;
const TooltipPortal = TooltipPrimitive.Portal;
interface TooltipContentProps
  extends
    ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    TooltipContentVariantsProps {}
const TooltipContent = ({
  ref,
  className,
  sideOffset = 4,
  size,
  ...props
}: TooltipContentProps & {
  ref?: Ref<HTMLDivElement>;
}) => (
  <TooltipPortal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipContentVariants({ size }), className)}
      {...props}
    />
  </TooltipPortal>
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const WithTooltip = ({
  ref,
  children,
  content,
  tooltipContentProps = {},
  tooltipTriggerProps = {},
  tooltipProps = {},
  arrowProps = {},
  showArrow = true,
  className,
  size,
}: WithTooltipProps & { ref?: Ref<HTMLDivElement> }) => {
  return (
    <Tooltip {...tooltipProps}>
      <TooltipTrigger asChild {...tooltipTriggerProps} className={className}>
        <div ref={ref}>{children}</div>
      </TooltipTrigger>
      <TooltipContent
        size={size}
        {...tooltipContentProps}
        className={cn(
          { 'overflow-visible': showArrow },
          tooltipContentProps.className
        )}
      >
        {content}
        {showArrow && (
          <TooltipArrow
            {...arrowProps}
            className={cn('fill-black dark:fill-white', arrowProps.className)}
          />
        )}
      </TooltipContent>
    </Tooltip>
  );
};
WithTooltip.displayName = 'WithTooltip';
export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
  WithTooltip,
};
