import type {
  Root,
  TooltipArrowProps,
  TooltipContentProps,
  Trigger,
} from '@radix-ui/react-tooltip';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import type { TooltipContentVariantsProps } from '../utils';

export interface WithTooltipProps extends TooltipContentVariantsProps {
  tooltipContentProps?: TooltipContentProps;
  tooltipTriggerProps?: Omit<
    ComponentPropsWithoutRef<typeof Trigger>,
    'children'
  >;
  tooltipProps?: Omit<ComponentPropsWithoutRef<typeof Root>, 'children'>;
  content: ReactNode;
  children: ReactNode;
  className?: string;
  arrowProps?: TooltipArrowProps;
  showArrow?: boolean;
}
