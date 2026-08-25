import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TeamIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M10.5 14.25A4.5 4.5 0 0 0 6 9.75m0 0a4.5 4.5 0 0 0-4.5 4.5M6 9.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10.5 4.5a4.5 4.5 0 0 0-4.5-4.5 3 3 0 0 0 0-6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
