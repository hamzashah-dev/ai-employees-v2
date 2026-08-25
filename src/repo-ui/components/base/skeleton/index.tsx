import type { HTMLAttributes } from 'react';

import { cn } from '@repo/ui/cn';

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('animate-pulse rounded-md', className)} {...props} />
  );
};
