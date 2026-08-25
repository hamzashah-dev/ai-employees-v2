import type { ButtonProps } from './types';
import { cn } from '@repo/ui/cn';
// Upstream imports this from the `radix-ui` umbrella package. Pulling every Radix
// primitive in for one Slot is not worth it here, so the scoped package is used instead.
import { Slot } from '@radix-ui/react-slot';
import { buttonVariants } from './utils';
export type { ButtonProps } from './types';
export { buttonVariants } from './utils';
export type { ButtonVariantProps } from './utils';
export const Button = ({
  ref,
  className,
  variant,
  size,
  shape,
  active,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, shape, className }))}
      data-active={active}
      ref={ref}
      {...props}
    />
  );
};
Button.displayName = 'Button';
