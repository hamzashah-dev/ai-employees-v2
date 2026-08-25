import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const UserAccountIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8 10a6.5 6.5 0 0 0-6 4h12a6.5 6.5 0 0 0-6-4"
    />
  </svg>
);
