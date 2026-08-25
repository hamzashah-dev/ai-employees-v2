import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ClockPendingIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 16 16" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      d="M13.93 7.077a6 6 0 0 1 0 1.846M11.516 3.14c.528.382.99.847 1.369 1.377m0 6.968A6 6 0 1 1 8.923 2.07M8 5.692V8l2.345 2.732"
    />
  </svg>
);
