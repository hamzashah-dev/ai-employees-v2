import type { PropsWithClassName } from '@repo/types/common';
import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  FC,
  HTMLAttributes,
} from 'react';
import type { SheetVariantProps } from './utils';
import { XIcon } from '@repo/icons/x';
import { cn } from '@repo/ui/cn';

// Upstream imports this from the `radix-ui` umbrella package. The scoped package is used
// here instead, to avoid pulling in every Radix primitive for one component.
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { Button } from '../button';
import { sheetVariants } from './utils';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & {
  ref?: React.RefObject<ComponentRef<typeof SheetPrimitive.Overlay> | null>;
}) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/75 backdrop-blur-[8px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

interface SheetContentProps
  extends
    ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    SheetVariantProps {}

const SheetContent = ({
  ref,
  side = 'right',
  className,
  children,
  ...props
}: SheetContentProps & {
  ref?: React.RefObject<ComponentRef<typeof SheetPrimitive.Content> | null>;
}) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 border border-primary px-5 py-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetCloseButton: FC<PropsWithClassName> = ({ className }) => {
  return (
    <SheetClose asChild className="!mt-0">
      <Button variant="ghost" size="icon-sm" shape="pill" className={className}>
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </Button>
    </SheetClose>
  );
};

SheetCloseButton.displayName = 'SheetCloseButton';

const SheetFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
  ref?: React.RefObject<ComponentRef<typeof SheetPrimitive.Title> | null>;
}) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-body-lg font-medium', className)}
    {...props}
  />
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & {
  ref?: React.RefObject<ComponentRef<typeof SheetPrimitive.Description> | null>;
}) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
);
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
