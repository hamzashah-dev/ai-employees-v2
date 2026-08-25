import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ContractIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="m2.666 2.666 4 4m0 0H3.11m3.556 0V3.11m6.667 10.223-4-4m0 0h3.555m-3.555 0v3.555"
    />
  </svg>
);
