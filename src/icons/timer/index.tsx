import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TimerIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="none"
    className={className}
  >
    <path
      d="M8.332 2.167h3.333m-1.666 10 2.5-2.5m4.166 2.5a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
