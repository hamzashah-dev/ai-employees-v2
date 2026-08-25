import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@repo/ui/cn';

const Table = ({
  ref,
  className,
  containerClassName,
  ...props
}: HTMLAttributes<HTMLTableElement> & {
  ref?: React.RefObject<HTMLTableElement | null>;
  containerClassName?: string;
}) => (
  <div className={cn('relative w-full overflow-auto', containerClassName)}>
    <table
      ref={ref}
      data-slot="table"
      className={cn('w-full caption-bottom text-body-sm', className)}
      {...props}
    />
  </div>
);
Table.displayName = 'Table';

const TableHeader = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn('[&_tr]:border-b [&_tr]:border-secondary', className)}
    {...props}
  />
);
TableHeader.displayName = 'TableHeader';

const TableBody = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
);
TableBody.displayName = 'TableBody';

const TableFooter = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      'border-t border-secondary bg-surface font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
);
TableFooter.displayName = 'TableFooter';

const TableRow = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.RefObject<HTMLTableRowElement | null>;
}) => (
  <tr
    ref={ref}
    data-slot="table-row"
    className={cn(
      'border-b border-secondary transition-colors hover:bg-surface-variant data-[state=selected]:bg-surface-variant',
      className
    )}
    {...props}
  />
);
TableRow.displayName = 'TableRow';

const TableHead = ({
  ref,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement | null>;
}) => (
  <th
    ref={ref}
    data-slot="table-head"
    className={cn(
      'h-10 px-3 text-left align-middle text-label-sm font-medium text-secondary [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
);
TableHead.displayName = 'TableHead';

const TableCell = ({
  ref,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement | null>;
}) => (
  <td
    ref={ref}
    data-slot="table-cell"
    className={cn(
      'px-3 py-2.5 align-middle text-primary [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
);
TableCell.displayName = 'TableCell';

const TableCaption = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.RefObject<HTMLTableCaptionElement | null>;
}) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn('mt-4 text-body-sm text-secondary', className)}
    {...props}
  />
);
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
