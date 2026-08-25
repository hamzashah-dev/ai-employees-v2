import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AnimateIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <rect
      x="2"
      y="2"
      width="10"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M5 7l1.5 1.5L9 5.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
