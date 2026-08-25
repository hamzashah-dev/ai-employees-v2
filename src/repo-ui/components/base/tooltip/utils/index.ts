import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const tooltipContentVariants = cva(
  'z-50 overflow-hidden bg-fill-inverse text-label-sm text-inverse shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      size: {
        sm: 'px-2.5 py-1 rounded-lg',
        md: 'px-4 py-1.5 rounded-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type TooltipContentVariantsProps = VariantProps<
  typeof tooltipContentVariants
>;
