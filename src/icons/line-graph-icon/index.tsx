import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LineGraphIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m6.737 15.599 3.899-5.389 5.695 2.408L20 6.54M4 4v16h16"
    />
  </svg>
);
