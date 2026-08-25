import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import type { TabsListVariantsProps, TabsTriggerVariantsProps } from './utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@repo/ui/cn';

import { tabsListVariants, tabsTriggerVariants } from './utils';

const Tabs = TabsPrimitive.Root;

const TabsList = ({
  ref,
  className,
  size,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
  TabsListVariantsProps & {
    ref?: React.RefObject<ElementRef<typeof TabsPrimitive.List> | null>;
  }) => {
  return (
    // Upstream wraps the list in `HorizontalScrollShadowWrapper`, a thin skin over
    // `@heroui/scroll-shadow` — a whole HeroUI package plus its Tailwind plugin (for
    // `scrollbar-none`) pulled in to fade the tab strip's edges. The load-bearing half of
    // that is one overflow container, kept here; the gradient masks and the overflow
    // scroll buttons are dropped. See `src/repo-ui/README.md`.
    <div className="relative w-full">
      <div className="mx-auto w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsPrimitive.List
          ref={ref}
          className={cn(tabsListVariants({ size }), className)}
          {...props}
        />
      </div>
    </div>
  );
};
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps
  extends
    ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    TabsTriggerVariantsProps {
  startSlot?: ReactNode | null;
  endSlot?: ReactNode | null;
}

const TabsTrigger = ({
  ref,
  className,
  size,
  variant,
  children,
  startSlot,
  endSlot,
  ...props
}: TabsTriggerProps & {
  ref?: React.RefObject<ElementRef<typeof TabsPrimitive.Trigger> | null>;
}) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants({ size, variant }),
      'cursor-pointer flex-row items-center gap-2',
      className
    )}
    {...props}
  >
    {startSlot && <span className="relative">{startSlot}</span>}
    {children && <span className="relative">{children}</span>}
    {endSlot && <span className="relative">{endSlot}</span>}
  </TabsPrimitive.Trigger>
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
  ref?: React.RefObject<ElementRef<typeof TabsPrimitive.Content> | null>;
}) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('focus-visible:outline-none', className)}
    {...props}
  />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
