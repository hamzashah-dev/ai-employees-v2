import type {
  PropsWithChildrenAndClassName,
  PropsWithClassName,
} from '@repo/types/common';
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ComponentRef,
  FC,
  HTMLAttributes,
} from 'react';
import type {
  DropDownMenuContentVariantsProp,
  DropDownMenuItemVariantsProp,
  DropDownMenuTriggerVariantsProp,
} from './utils';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { DropdownIcon } from '@repo/icons/dorpdown-icon';

import { cn } from '@repo/ui/cn';

import {
  dropdownMenuContentVariants,
  dropdownMenuItemVariants,
  dropdownMenuTriggerVariants,
} from './utils';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuIcon: FC<PropsWithClassName & { animate?: boolean }> = ({
  className,
  animate = true,
}) => {
  return (
    <DropdownIcon
      className={cn(
        'size-5 transform stroke-[0.8px] text-primary group-disabled:text-disabled group-data-[state=open]:-rotate-180 in-[.sm]:size-4.5',
        animate && 'transition-all duration-500',
        className
      )}
    />
  );
};

const DropdownMenuTrigger = ({
  ref,
  className,
  size,
  children,
  variant,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> &
  DropDownMenuTriggerVariantsProp & {
    ref?: React.RefObject<ComponentRef<
      typeof DropdownMenuPrimitive.Trigger
    > | null>;
  }) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      'group placeholder-tertiary disabled:placeholder-disabled flex w-full items-center justify-between bg-transparent text-left text-primary ring-1 transition-all duration-500 outline-none ring-inset focus:outline-none active:font-medium disabled:cursor-not-allowed disabled:text-disabled data-placeholder:text-secondary data-[state=open]:text-primary',
      dropdownMenuTriggerVariants({
        className,
        size,
        variant,
      })
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
);

DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

const DropdownMenuSubTrigger = ({
  ref,
  className,
  inset,
  children,
  size,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
  size?: DropDownMenuItemVariantsProp['size'];
} & {
  ref?: React.RefObject<ComponentRef<
    typeof DropdownMenuPrimitive.SubTrigger
  > | null>;
}) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm ring-0 outline-none select-none focus:bg-fill-variant-hover data-[state=open]:bg-fill-variant-hover',
      dropdownMenuItemVariants({
        size,
      }),
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.SubTrigger>
);
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = ({
  ref,
  className,
  size,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & {
  size?: DropDownMenuContentVariantsProp['size'];
  ref?: React.RefObject<ComponentRef<
    typeof DropdownMenuPrimitive.SubContent
  > | null>;
}) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      dropdownMenuContentVariants({
        className,
        size,
      })
    )}
    {...props}
  />
);
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = ({
  ref,
  className,
  size,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content> &
  DropDownMenuContentVariantsProp) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        dropdownMenuContentVariants({
          className,
          size,
        })
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = ({
  ref,
  className,
  size,
  inset,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  size?: DropDownMenuItemVariantsProp['size'];
} & {
  ref?: React.RefObject<ComponentRef<typeof DropdownMenuPrimitive.Item> | null>;
}) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'flex w-full cursor-pointer items-center justify-start px-2.5 py-2 text-primary transition-all duration-500 outline-none select-none hover:bg-fill-variant-hover active:bg-fill-variant-active disabled:bg-fill-variant-disabled data-disabled:pointer-events-none data-disabled:bg-fill-variant-disabled data-disabled:text-disabled',
      dropdownMenuItemVariants({
        size,
      }),
      inset && 'pl-8',
      className
    )}
    {...props}
  />
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItemStart: FC<PropsWithChildrenAndClassName> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'absolute right-2 flex h-3.5 w-3.5 items-center justify-center',
        className
      )}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        {children}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  );
};

const DropdownMenuCheckboxItemEnd: FC<PropsWithChildrenAndClassName> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'absolute right-2 flex size-fit items-center justify-center',
        className
      )}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        {children}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  );
};

const DropdownMenuCheckboxItemRoot = ({
  ref,
  className,
  children,
  checked,
  size,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & {
  size?: DropDownMenuItemVariantsProp['size'];
} & {
  ref?: React.RefObject<ComponentRef<
    typeof DropdownMenuPrimitive.CheckboxItem
  > | null>;
}) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default items-center transition-all duration-500 outline-none select-none hover:bg-fill-variant-hover data-disabled:pointer-events-none data-disabled:opacity-50',
      dropdownMenuItemVariants({
        size,
      }),
      className
    )}
    checked={checked}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);

DropdownMenuCheckboxItemRoot.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItemStart: FC<PropsWithChildrenAndClassName> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        className
      )}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        {children}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  );
};

const DropdownMenuRadioItemEnd: FC<PropsWithChildrenAndClassName> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'absolute right-2 flex h-3.5 w-3.5 items-center justify-center',
        className
      )}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        {children}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  );
};

const DropdownMenuRadioItemRoot = ({
  ref,
  className,
  children,
  size,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
  size?: DropDownMenuItemVariantsProp['size'];
} & {
  ref?: React.RefObject<ComponentRef<
    typeof DropdownMenuPrimitive.RadioItem
  > | null>;
}) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative mb-0.5 flex cursor-default items-center transition-all duration-500 outline-none select-none last:mb-0 hover:bg-fill-variant-hover data-[state=active]:bg-fill-variant-active data-[state=open]:bg-fill-variant-hover data-[state=open]:focus:bg-fill-variant-hover data-disabled:pointer-events-none data-disabled:opacity-50',
      dropdownMenuItemVariants({
        size,
      }),
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.RadioItem>
);
DropdownMenuRadioItemRoot.displayName =
  DropdownMenuPrimitive.RadioItem.displayName;

// TODO: update if used later on
const DropdownMenuLabel = ({
  ref,
  className,
  inset,
  size,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
  size?: DropDownMenuItemVariantsProp['size'];
} & {
  ref?: React.RefObject<ComponentRef<
    typeof DropdownMenuPrimitive.Label
  > | null>;
}) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'font-medium',
      dropdownMenuItemVariants({
        size,
      }),
      inset && 'pl-8',
      className
    )}
    {...props}
  />
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = ({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> & {
  ref?: React.RefObject<ComponentRef<
    typeof DropdownMenuPrimitive.Separator
  > | null>;
}) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-2 my-1 h-px border-b border-primary', className)}
    {...props}
  />
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

const DropdownMenuCheckboxItem = {
  Root: DropdownMenuCheckboxItemRoot,
  Start: DropdownMenuCheckboxItemStart,
  End: DropdownMenuCheckboxItemEnd,
};

const DropdownMenuRadioItem = {
  Root: DropdownMenuRadioItemRoot,
  Start: DropdownMenuRadioItemStart,
  End: DropdownMenuRadioItemEnd,
};

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
