import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const UserIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M4.626 14.137A3 3 0 0 1 7.5 12h3a3 3 0 0 1 2.876 2.141M2.25 9a6.75 6.75 0 1 0 13.5 0 6.75 6.75 0 0 0-13.5 0Zm4.5-1.5a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0Z"
    />
  </svg>
);
