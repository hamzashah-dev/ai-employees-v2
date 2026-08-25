import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BellIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14" fill="none" className={className}>
    <path
      stroke="currentColor"
      d="M7.75 12.75h-2a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2ZM11.114 5.194c0-1.178-.46-2.309-1.278-3.142A4.32 4.32 0 0 0 6.75.75a4.32 4.32 0 0 0-3.086 1.302 4.49 4.49 0 0 0-1.278 3.142v3.89c0 .441-.172.865-.479 1.178a1.62 1.62 0 0 1-1.157.488h12c-.434 0-.85-.176-1.157-.488a1.68 1.68 0 0 1-.48-1.179z"
    />
  </svg>
);
