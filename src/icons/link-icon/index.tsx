import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LinkIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M6.793 8.604a3.018 3.018 0 0 0 4.55.326l1.81-1.812A3.021 3.021 0 0 0 11.01 2a3.015 3.015 0 0 0-2.122.848L7.849 3.88m1.358 3.515a3.018 3.018 0 0 0-4.55-.326l-1.81 1.812A3.022 3.022 0 0 0 4.99 14a3.015 3.015 0 0 0 2.122-.848l1.032-1.033"
    />
  </svg>
);
