import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RightWallArrowIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M3 5v14m18-7H7m14 0-6 6m6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
