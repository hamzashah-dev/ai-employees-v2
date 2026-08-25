import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const InfinityIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth=".85"
      d="M8 8a6.7 6.7 0 0 1-1.447 1.885 2.666 2.666 0 1 1 0-3.77A6.7 6.7 0 0 1 8 8m0 0A6.7 6.7 0 0 1 9.45 6.114a2.667 2.667 0 1 1 0 3.771A6.7 6.7 0 0 1 8 8"
    />
  </svg>
);
