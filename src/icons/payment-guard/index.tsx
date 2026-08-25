import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PaymentGuardIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    className={className}
  >
    <path
      d="m6.5 8.503 1.5 1.5 2.5-3.5m-2-4.69a7.973 7.973 0 0 1-5.601 2.19A8.004 8.004 0 0 0 8.5 14.251a8.003 8.003 0 0 0 5.601-10.248H14a7.97 7.97 0 0 1-5.5-2.19Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
