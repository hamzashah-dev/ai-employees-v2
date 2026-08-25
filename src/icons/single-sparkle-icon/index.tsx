import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SingleSparkleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="12"
    height="12"
    fill="none"
    viewBox="0 0 12 12"
    className={className}
  >
    <path
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M6.001 1.874A10.26 10.26 0 0 0 10.128 6c-1.762.955-3.19 2.4-4.126 4.125a10.26 10.26 0 0 0-4.128-4.126c1.762-.955 3.19-2.4 4.127-4.125"
    />
  </svg>
);
