import type { BadgeProps } from './types';
import { cn } from '@repo/ui/cn';
import { badgeVariants } from './utils';

const Badge = ({
  className,
  variant,
  disabled,
  size,
  ...props
}: BadgeProps) => {
  return (
    <div
      className={cn(badgeVariants({ variant, disabled, size }), className)}
      {...props}
    />
  );
};

export { Badge };
export type { BadgeProps } from './types';
