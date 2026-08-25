import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LeftWallIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M2.25 14.25V3.75m7.5.75L5.25 9m0 0 4.5 4.5M5.25 9h10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
