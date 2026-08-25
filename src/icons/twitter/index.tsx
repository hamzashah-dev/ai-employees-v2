import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TwitterIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m4 20 6.768-6.768m2.46-2.46L20 4M4 4l11.733 16H20L8.267 4z"
    />
  </svg>
);
