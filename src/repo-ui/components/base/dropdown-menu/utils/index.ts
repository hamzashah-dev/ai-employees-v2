import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const dropdownMenuTriggerVariants = cva('', {
  variants: {
    size: {
      sm: 'h-7 py-1.5 px-2 rounded-[10px] text-label-sm gap-1 [&>svg]:size-[14px] [&>svg]:stroke-1',
      md: 'h-8 px-2.5 py-1.5 rounded-xl text-label-md gap-1.5 [&>svg]:size-4 [&>svg]:stroke-1',
      lg: 'h-10 py-2.5 px-3 rounded-2xl text-label-lg gap-2 [&>svg]:size-[18px] [&>svg]:stroke-1',
      xl: 'h-12 py-3 px-3.5 rounded-[18px] text-label-xl gap-2 [&>svg]:size-5 [&>svg]:stroke-1',
      'icon-sm': 'size-7 rounded-[10px] p-1.5 [&>svg]:size-4 [&>svg]:stroke-1',
      'icon-md':
        'size-8 rounded-xl p-[7px] [&>svg]:size-[18px] [&>svg]:stroke-[1.2px]',
      'icon-lg':
        'size-10 rounded-2xl p-2.5 [&>svg]:size-5 [&>svg]:stroke-[1.5px]',
      'icon-xl':
        'size-12 rounded-[18px] p-3 [&>svg]:size-6 [&>svg]:stroke-[1.5px]',
    },
    variant: {
      primary:
        'ring-secondary hover:ring-secondary-hover focus-visible:ring-inverse data-[disabled]:ring-secondary-disabled data-[state=open]:ring-inverse',
      secondary:
        'ring-tertiary hover:ring-tertiary-hover focus-visible:ring-inverse data-[disabled]:ring-tertiary-disabled data-[state=open]:ring-inverse',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

export const dropdownMenuContentVariants = cva(
  'z-50 w-full p-2 rounded-2xl border bg-surface-variant border-primary text-primary shadow-sm gap-0.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      size: {
        sm: 'rounded-xl',
        md: 'rounded-xl',
        lg: 'rounded-[20px]',
        xl: 'rounded-[20px]',
      },
      variant: {
        primary: 'bg-surface-variant border-primary shadow-sm',
        secondary: 'bg-surface-elevated border-elevated shadow-sm',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export const dropdownMenuItemVariants = cva('', {
  variants: {
    size: {
      sm: 'h-7 py-1.5 px-2 rounded-[10px] text-label-sm gap-1 [&>svg]:size-[14px] [&>svg]:stroke-1',
      md: 'h-8 px-2.5 py-1.5 rounded-xl text-label-md gap-1.5 [&>svg]:size-4 [&>svg]:stroke-1',
      lg: 'h-10 py-2.5 px-3 rounded-2xl text-label-lg gap-2 [&>svg]:size-[18px] [&>svg]:stroke-1',
      xl: 'h-12 py-3 px-3.5 rounded-[18px] text-label-xl gap-2 [&>svg]:size-5 [&>svg]:stroke-1',
    },
    variant: {
      primary:
        'bg-transparent text-primary hover:bg-fill-variant-hover active:bg-fill-variant-hover disabled:text-disabled',
      secondary:
        'bg-transparent text-primary hover:bg-fill-elevated-hover active:bg-fill-elevated-hover disabled:text-disabled',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

export type DropDownMenuTriggerVariantsProp = VariantProps<
  typeof dropdownMenuTriggerVariants
>;

export type DropDownMenuContentVariantsProp = VariantProps<
  typeof dropdownMenuContentVariants
>;

export type DropDownMenuItemVariantsProp = VariantProps<
  typeof dropdownMenuItemVariants
> & {
  hiddenIndicator?: boolean;
};
