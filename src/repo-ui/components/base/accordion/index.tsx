import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  FC,
  PropsWithChildren,
} from 'react';
import { cn } from '@repo/ui/cn';

// Upstream imports both of these from the `radix-ui` umbrella package. The scoped
// packages are used here instead, to avoid pulling in every Radix primitive for one
// component — same adaptation as `button/index.tsx` and `sheet/index.tsx`.
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Slot } from '@radix-ui/react-slot';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
  ref?: React.RefObject<ComponentRef<typeof AccordionPrimitive.Item> | null>;
}) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('my-2 w-full rounded-[14px] bg-surface px-4.5', className)}
    {...props}
  />
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = ({
  ref,
  className,
  headerClassName,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
  headerClassName?: string;
  ref?: React.RefObject<ComponentRef<typeof AccordionPrimitive.Trigger> | null>;
}) => (
  <AccordionPrimitive.Header className={cn('flex', headerClassName)}>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-body-md text-primary transition-all [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionTriggerIcon: FC<
  PropsWithChildren & {
    className?: string;
  }
> = ({ children, className }) => {
  return (
    <Slot
      className={cn(
        'size-4.5 shrink-0 text-primary transition-transform duration-200',
        className
      )}
    >
      {children}
    </Slot>
  );
};

const AccordionContent = ({
  ref,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
  ref?: React.RefObject<ComponentRef<typeof AccordionPrimitive.Content> | null>;
}) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-body-sm text-primary transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pt-0 pb-4', className)}>{children}</div>
  </AccordionPrimitive.Content>
);

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionTriggerIcon,
};
