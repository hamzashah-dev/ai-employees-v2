import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@repo/ui/cn';

import * as React from 'react';

import {
  segmentedControlsTriggerVariants,
  segmentedControlsVariants,
} from './utils';

const SegmentedControls = TabsPrimitive.Root;

/**
 * To achieve the `secondary-variant` design, use:
 *   - `listVariant="primary"`
 *   - `tabVariant="secondary"`
 *
 * This combination will render the segmented controls with the correct appearance
 * as specified in the design system for the `secondary-variant`.
 */

const SegmentedControlsList = ({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof segmentedControlsVariants>) => (
  <TabsPrimitive.List
    className={cn(segmentedControlsVariants({ variant, size }), className)}
    {...props}
  />
);

interface SegmentedControlsTriggerProps
  extends
    React.ComponentProps<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof segmentedControlsTriggerVariants> {
  startSlot?: ReactNode;
  endSlot?: ReactNode;
}

const SegmentedControlsTrigger = ({
  className,
  size,
  variant,
  children,
  startSlot,
  endSlot,
  ...props
}: SegmentedControlsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      'group relative inline-flex items-center justify-center whitespace-nowrap transition-all duration-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      segmentedControlsTriggerVariants({ size, variant }),
      className
    )}
    {...props}
  >
    {startSlot && <span className="relative">{startSlot}</span>}
    <span className="relative">{children}</span>
    {endSlot && <span className="relative">{endSlot}</span>}
  </TabsPrimitive.Trigger>
);

const SegmentedControlsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn('focus:outline-none', className)}
    {...props}
  />
);

export {
  SegmentedControls,
  SegmentedControlsContent,
  SegmentedControlsList,
  SegmentedControlsTrigger,
  type SegmentedControlsTriggerProps,
};
