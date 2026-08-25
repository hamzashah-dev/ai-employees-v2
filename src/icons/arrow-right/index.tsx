import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowRight: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    className={className}
  >
    <path
      d="M4.25 9h10.5m0 0L9.5 3.75M14.75 9 9.5 14.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
