import type { VariantProps } from 'class-variance-authority';
import { buttonBase } from '@repo/utils/base-button';
import { cva } from 'class-variance-authority';

const variant = {
  primary:
    'bg-fill-inverse text-inverse hover:bg-fill-inverse-hover active:bg-fill-inverse-hover data-[active=true]:bg-fill-inverse-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-inverse disabled:bg-fill-secondary-disabled disabled:text-disabled',
  brand:
    'bg-fill-brand text-inverse-fixed hover:bg-fill-brand-hover active:bg-fill-brand-hover data-[active=true]:bg-fill-brand-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand disabled:bg-fill-secondary-disabled disabled:text-disabled',
  // secondary is also used for icon-filled
  secondary:
    'bg-fill-secondary text-primary hover:bg-fill-secondary-hover active:bg-fill-secondary-hover data-[active=true]:bg-fill-secondary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:bg-fill-secondary-disabled disabled:text-disabled',
  'secondary-variant':
    'bg-fill-tertiary text-primary hover:bg-fill-tertiary-hover active:bg-fill-tertiary-hover data-[active=true]:bg-fill-tertiary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary disabled:bg-fill-tertiary-disabled disabled:text-disabled',
  tertiary:
    'bg-fill-tertiary text-primary hover:bg-fill-tertiary-hover active:bg-fill-tertiary-active data-[active=true]:bg-fill-tertiary-active focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tertiary disabled:bg-fill-tertiary-disabled disabled:text-disabled',
  'brand-tonal':
    'bg-fill-brand-secondary text-brand hover:bg-fill-brand-secondary-hover active:bg-fill-brand-secondary-hover data-[active=true]:bg-fill-brand-secondary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-secondary disabled:bg-fill-secondary-disabled disabled:text-disabled',
  'brand-ghost':
    'text-brand hover:bg-fill-brand-secondary hover:border-transparent active:bg-fill-brand-secondary active:border-transparent data-[active=true]:bg-fill-brand-secondary data-[active=true]:border-transparent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-secondary-hover focus-visible:bg-fill-brand-secondary disabled:text-disabled disabled:bg-fill-brand-secondary-disabled',
  outline:
    'text-primary border-secondary border hover:bg-fill-secondary hover:border-transparent active:bg-fill-secondary active:border-transparent data-[active=true]:bg-fill-secondary data-[active=true]:border-transparent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:bg-fill-secondary focus-visible:ring-primary disabled:text-secondary-disabled disabled:border-secondary-disabled',
  // ghost is also used for icon-subtle
  ghost:
    'text-primary hover:bg-fill-secondary active:bg-fill-secondary data-[active=true]:bg-fill-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:bg-fill-secondary disabled:text-secondary-disabled',
  'ghost-variant':
    'text-primary hover:bg-fill-tertiary active:bg-fill-tertiary data-[active=true]:bg-fill-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary focus-visible:bg-fill-tertiary disabled:text-secondary-disabled',
  success:
    'bg-fill-success text-inverse-fixed hover:bg-fill-success-hover active:bg-fill-success-hover data-[active=true]:bg-fill-success-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success disabled:text-disabled disabled:bg-fill-secondary-disabled',
  warning:
    'bg-fill-warning text-inverse-fixed hover:bg-fill-warning-hover active:bg-fill-warning-hover data-[active=true]:bg-fill-warning-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-warning disabled:text-disabled disabled:bg-fill-secondary-disabled',
  error:
    'bg-fill-critical text-inverse-fixed hover:bg-fill-critical-hover active:bg-fill-critical-hover data-[active=true]:bg-fill-critical-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-critical disabled:text-disabled disabled:bg-fill-secondary-disabled',
  inverse:
    'bg-fill text-inverse-fixed hover:bg-fill-hover active:bg-fill-active data-[active=true]:bg-fill-active focus-visible:ring-2 focus-visible:ring-offset-2 ring-tertiary disabled:text-inverse-fixed-disabled disabled:bg-fill-disabled',
  'on-image':
    'bg-black/40 backdrop-blur-[6px] hover:backdrop-blur-[12px] text-inverse-fixed hover:bg-black/30 active:bg-black/30 data-[active=true]:bg-black/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40 disabled:text-inverse-fixed-disabled disabled:bg-black/20',
  'on-image-variant':
    'bg-fill-secondary backdrop-blur-[6px] text-primary hover:bg-fill-secondary-hover active:bg-fill-secondary-hover data-[active=true]:bg-fill-secondary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:bg-fill-secondary-disabled disabled:text-disabled',
  'icon-outline':
    'text-primary border-secondary border hover:bg-fill-secondary hover:border-transparent active:bg-fill-secondary-hover active:border-transparent data-[active=true]:bg-fill-secondary-hover data-[active=true]:border-transparent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tertiary disabled:border-secondary-disabled disabled:text-disabled',
  'icon-ghost-tertiary':
    'text-tertiary hover:bg-fill-secondary active:bg-fill-secondary data-[active=true]:bg-fill-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:bg-fill-secondary disabled:text-disabled',
  'icon-ghost-secondary':
    'text-primary hover:bg-fill-tertiary active:bg-fill-tertiary data-[active=true]:bg-fill-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary focus-visible:bg-fill-tertiary disabled:text-disabled',
  'icon-ghost':
    'text-primary hover:bg-fill-secondary active:bg-fill-secondary data-[active=true]:bg-fill-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:bg-fill-secondary disabled:text-disabled',
  'icon-tertiary':
    'bg-fill-tertiary text-primary hover:bg-fill-tertiary-hover active:bg-fill-tertiary-active data-[active=true]:bg-fill-tertiary-active focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tertiary disabled:bg-fill-tertiary-disabled disabled:text-disabled',
  'icon-primary':
    'bg-fill-inverse text-inverse hover:bg-fill-inverse-hover active:bg-fill-inverse-hover data-[active=true]:bg-fill-inverse-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-inverse disabled:bg-fill-inverse-disabled',
  'icon-brand':
    'bg-fill-brand text-inverse-fixed hover:bg-fill-brand-hover active:bg-fill-brand-hover data-[active=true]:bg-fill-brand-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand disabled:bg-fill-brand-disabled disabled:text-inverse-fixed-disabled',
  // secondary is also used for icon-filled
  'icon-secondary':
    'bg-fill-secondary text-primary hover:bg-fill-secondary-hover active:bg-fill-secondary-active data-[active=true]:bg-fill-secondary-active focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-focus disabled:bg-fill-secondary-disabled disabled:text-disabled',
  'link-accent':
    'text-brand hover:text-brand-hover active:text-brand-active data-[active=true]:text-brand-active focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-focus disabled:text-disabled',
  'link-secondary':
    'text-tertiary hover:text-primary active:text-primary data-[active=true]:text-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tertiary-hover disabled:text-tertiary-disabled',
  'link-primary':
    'text-primary hover:text-secondary active:text-secondary data-[active=true]:text-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-inverse disabled:text-disabled',
  none: '',
};

const size = {
  xs: 'gap-1 h-7 rounded-[10px] text-label-sm px-2 py-1.5 [&>svg]:size-[14px] [&>svg]:stroke-1',
  sm: 'gap-1.5 h-8 rounded-xl text-label-md px-2.5 py-1.5 [&>svg]:size-4 [&>svg]:stroke-[1.2px]',
  md: 'gap-2 h-10 rounded-2xl text-label-lg px-3 py-2.5 [&>svg]:size-[18px] [&>svg]:stroke-[1.5px]',
  lg: 'gap-2 h-12 rounded-[18px] text-label-xl px-4 py-3 [&>svg]:size-5 [&>svg]:stroke-[1.5px]',
  xl: 'gap-2.5 h-14 rounded-[20px] text-heading-xs px-5 py-4 [&>svg]:size-6 [&>svg]:stroke-[1.8px]',
  // icon button sizes
  'icon-xs': 'size-7 rounded-[10px] p-1.5 [&>svg]:size-4 [&>svg]:stroke-1',
  'icon-sm':
    'size-8 rounded-xl p-[7px] [&>svg]:size-[18px] [&>svg]:stroke-[1.2px]',
  'icon-md': 'size-10 rounded-2xl p-2.5 [&>svg]:size-5 [&>svg]:stroke-[1.5px]',
  'icon-lg': 'size-12 rounded-[18px] p-3 [&>svg]:size-6 [&>svg]:stroke-[1.5px]',
  'icon-xl':
    'size-14 rounded-[20px] p-3.5 [&>svg]:size-7 [&>svg]:stroke-[1.8px]',
  none: '',
};

const shape = {
  rect: '',
  pill: 'rounded-full',
};

export const buttonVariants = cva(buttonBase(), {
  variants: {
    variant,
    size,
    shape,
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    shape: 'rect',
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
