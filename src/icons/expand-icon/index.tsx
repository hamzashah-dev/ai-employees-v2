import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ExpandIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="m6.666 9.334-4 4m0 0V9.778m0 3.556h3.556m3.11-6.667 4-4m0 0v3.556m0-3.556H9.778"
    />
  </svg>
);
