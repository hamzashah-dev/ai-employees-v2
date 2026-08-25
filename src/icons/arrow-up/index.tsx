import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowUpIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    className={className}
  >
    <path
      d="M3.333 8.632 8 3.965m0 0 4.667 4.667M8 3.965v9.333"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
