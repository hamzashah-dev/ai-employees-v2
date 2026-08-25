import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ClockIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="currentStroke"
      d="M12 7.154V12h3.461M3.69 8.538A9.003 9.003 0 0 1 21 12a9 9 0 0 1-17.76 2.077m-.24-9v3.461h3.462"
    />
  </svg>
);
