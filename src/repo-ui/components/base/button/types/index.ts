import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';

import type { ButtonVariantProps } from '../utils';

export interface ButtonProps
  extends ComponentProps<'button'>, ButtonVariantProps {
  asChild?: boolean;
  active?: boolean;
  startSlot?: ReactNode | null;
  endSlot?: ReactNode | null;
  startSlotProps?: HTMLAttributes<HTMLDivElement>;
  endSlotProps?: HTMLAttributes<HTMLDivElement>;
}
