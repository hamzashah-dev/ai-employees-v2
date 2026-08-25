import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const WaveIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M2 7h3l2-4 2 8 2-4h3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
