import { cva } from 'class-variance-authority';

export const SEGMENTED_CONTROLS_VARIANTS = {
  primary: 'bg-surface-secondary',
  secondary: 'bg-surface',
  'secondary-variant': 'bg-surface-secondary',
  brand: 'bg-fill-brand',
  none: '',
} as const;

export const SEGMENTED_CONTROLS_SIZES = {
  sm: 'p-[3px] rounded-xl',
  md: 'p-1 rounded-2xl',
} as const;

export const segmentedControlsVariants = cva(
  'inline-flex data-[orientation=horizontal]:w-max items-center justify-start gap-1 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:flex-row',
  {
    variants: {
      variant: SEGMENTED_CONTROLS_VARIANTS,
      size: SEGMENTED_CONTROLS_SIZES,
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const SEGMENTED_CONTROLS_TRIGGER_VARIANTS = {
  primary:
    'data-[state=active]:bg-fill-inverse data-[state=active]:text-inverse group-data-[state=active]:bg-fill-inverse',
  secondary:
    'data-[state=active]:bg-fill-tertiary data-[state=active]:text-primary group-data-[state=active]:bg-fill-tertiary',
  'secondary-variant':
    'data-[state=active]:bg-fill-tertiary data-[state=active]:text-primary group-data-[state=active]:bg-fill-tertiary',
  brand:
    'data-[state=active]:bg-fill-brand data-[state=active]:text-inverse group-data-[state=active]:bg-fill-brand',
  none: '',
} as const;

export const SEGMENTED_CONTROLS_TRIGGER_SIZES = {
  sm: 'h-[26px] px-2.5 py-1.5 gap-1 *:[span]:gap-1 text-label-sm rounded-[10px] [&_svg]:size-3.5 [&_svg]:stroke-[2]',
  md: 'h-8 px-3 py-1.5 gap-1.5 *:[span]:gap-1.5 text-label-md rounded-xl [&_svg]:size-4 [&_svg]:stroke-[2]',
} as const;

export const segmentedControlsTriggerVariants = cva(
  'inline-flex w-full items-center justify-center gap-2 font-medium text-tertiary cursor-pointer hover:text-primary disabled:text-disabled',
  {
    variants: {
      variant: SEGMENTED_CONTROLS_TRIGGER_VARIANTS,
      size: SEGMENTED_CONTROLS_TRIGGER_SIZES,
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
