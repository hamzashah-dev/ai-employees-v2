import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ConnectorsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m2.25 15.75 1.688-1.687m0 0a3.18 3.18 0 0 0 4.5 0l1.124-1.126-4.5-4.5-1.125 1.126a3.18 3.18 0 0 0 0 4.5M15.75 2.25l-1.687 1.688m0 0a3.18 3.18 0 0 1 0 4.5l-1.126 1.124-4.5-4.5 1.126-1.125a3.18 3.18 0 0 1 4.5 0M6.187 9.561l1.688-1.687m.563 3.938 1.687-1.688"
    />
  </svg>
);
