import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowUpToLineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M5 3h14m-1 10-6-6m0 0-6 6m6-6v14"
    />
  </svg>
);
