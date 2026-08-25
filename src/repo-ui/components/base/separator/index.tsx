import type { ComponentPropsWithoutRef, ComponentRef } from 'react';
import { cn } from '@repo/ui/cn';
// Upstream imports this from the `radix-ui` umbrella package. The scoped package is used
// here instead, to avoid pulling in every Radix primitive for one component.
import * as SeparatorPrimitive from '@radix-ui/react-separator';

export const Separator = ({
  ref,
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
  ref?: React.Ref<ComponentRef<typeof SeparatorPrimitive.Root>>;
}) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-fill-secondary',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
