import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ComponentRef,
  FC,
  HTMLAttributes,
} from 'react';
import { XIcon } from '@repo/icons/x';
import { cn } from '@repo/ui/cn';

// Upstream imports this from the `radix-ui` umbrella package. The scoped package is used
// here instead, to avoid pulling in every Radix primitive for one component — same
// adaptation as `sheet/index.tsx`, which wraps the very same primitive.
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../button';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Overlay> | null>;
}) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      'fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = ({
  ref,
  className,
  children,
  showOverlay = true,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  showOverlay?: boolean;
} & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Content> | null>;
}) => (
  <DialogPortal>
    {showOverlay && <DialogOverlay />}
    <DialogPrimitive.Content
      ref={ref}
      data-slot="dialog-content"
      className={cn(
        'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-secondary bg-surface-variant p-4 text-sm duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex w-full items-center justify-between pt-2 pr-1',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
DialogHeader.displayName = 'DialogHeader';

const DialogCloseButton: FC<ComponentProps<typeof Button>> = ({
  variant = 'icon-ghost',
  size = 'icon-xs',
  shape = 'rect',
  className,
  ...props
}) => {
  return (
    <DialogClose asChild>
      <Button
        variant={variant}
        size={size}
        shape={shape}
        className={className}
        {...props}
      >
        <XIcon />
        <span className="sr-only">Close</span>
      </Button>
    </DialogClose>
  );
};

DialogCloseButton.displayName = 'DialogCloseButton';

const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 mobile:flex-row mobile:justify-end',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Title> | null>;
}) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-label-xl font-medium text-primary', className)}
    {...props}
  />
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  ref?: React.RefObject<ComponentRef<
    typeof DialogPrimitive.Description
  > | null>;
}) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-body-md font-normal text-secondary', className)}
    {...props}
  />
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
