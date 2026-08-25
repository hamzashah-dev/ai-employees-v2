import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CreditCardIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeWidth="currentStroke"
      d="M2.25 6.563h13.5m-12-2.813h10.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z"
    />
  </svg>
);
