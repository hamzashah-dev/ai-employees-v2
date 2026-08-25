import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const tabsListVariants = cva(
  'inline-flex items-center justify-center px-1',
  {
    variants: {
      size: {
        sm: 'h-9 gap-1 rounded-[10px]',
        md: 'h-10 gap-1.5 rounded-xl',
        lg: 'h-12 gap-2 rounded-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const tabsTriggerVariants = cva(
  'group relative inline-flex h-full flex-col items-center justify-center whitespace-nowrap border border-secondary text-secondary transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:border-secondary-disabled disabled:text-secondary-disabled disabled:pointer-events-none',
  {
    variants: {
      size: {
        sm: 'h-7 px-2 py-1.5 text-label-sm rounded-[10px] gap-1',
        md: 'h-8 px-3 py-1.5 text-label-md rounded-xl gap-1.5',
        lg: 'h-10 px-4 py-2.5 text-label-lg rounded-2xl gap-2',
      },
      variant: {
        brand:
          'hover:border-transparent hover:bg-fill-secondary hover:text-primary data-[state=active]:border-transparent data-[state=active]:bg-fill-brand data-[state=active]:text-inverse-fixed',
        primary:
          'hover:border-transparent hover:bg-fill-secondary hover:text-primary data-[state=active]:border-transparent data-[state=active]:bg-fill-inverse data-[state=active]:text-inverse-fixed',
        secondary:
          'hover:bg-fill hover:text-primary data-[state=active]:bg-fill-secondary data-[state=active]:text-primary',
        'secondary-variant':
          'hover:border-transparent hover:bg-fill-secondary hover:text-primary data-[state=active]:border-transparent data-[state=active]:bg-fill-tertiary data-[state=active]:text-primary',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export type TabsListVariantsProps = VariantProps<typeof tabsListVariants>;
export type TabsTriggerVariantsProps = VariantProps<typeof tabsTriggerVariants>;
