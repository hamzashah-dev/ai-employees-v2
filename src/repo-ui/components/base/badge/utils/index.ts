import { cva } from 'class-variance-authority';

export const badgeVariants = cva('font-medium', {
  variants: {
    size: {
      sm: 'py-0 px-1 text-label-xs rounded-md',
      md: 'py-0.5 px-1.5 text-label-sm rounded-lg',
    },
    variant: {
      'neutral-subtle':
        'bg-fill-secondary text-secondary disabled:text-disabled disabled:bg-fill-secondary-disabled',
      'neutral-strong':
        'bg-fill-tertiary text-secondary disabled:text-disabled disabled:bg-fill-tertiary-disabled',
      'brand-on-surface':
        'bg-fill-brand-secondary text-brand disabled:text-brand-disabled disabled:bg-fill-brand-secondary-disabled',
      primary:
        'bg-fill-inverse text-inverse disabled:text-inverse-disabled disabled:bg-fill-inverse-disabled',
      'brand-on-image':
        'bg-fill-brand text-inverse-fixed disabled:text-inverse-fixed-disabled disabled:bg-fill-brand-disabled',
      'neutral-on-image':
        'bg-black/40 text-inverse-fixed disabled:text-inverse-fixed-disabled disabled:bg-black/20',
      'glass-on-image':
        'rounded-full border border-white bg-[linear-gradient(95deg,#fff_0%,rgb(255_255_255/0.6)_65.1%,rgb(255_255_255/0.8)_100%)] text-fixed shadow-[0_4px_8px_0_rgb(176_175_175/0.2)]',
      success:
        'bg-surface-success text-success disabled:text-disabled disabled:bg-fill-secondary-disabled',
      warning:
        'bg-surface-warning text-warning disabled:text-disabled disabled:bg-fill-secondary-disabled',
      critical:
        'bg-surface-critical text-critical disabled:text-disabled disabled:bg-fill-secondary-disabled',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'neutral-subtle',
    size: 'md',
    disabled: false,
  },
});
