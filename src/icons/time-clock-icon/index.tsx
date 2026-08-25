import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TimeClockIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M6.93 4.173V7h2.019m-2.02 5.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5"
    />
  </svg>
);
