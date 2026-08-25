import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RefreshIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M14 8c0 3.312-2.688 6-6 6s-5.334-3.336-5.334-3.336m0 0h2.712m-2.712 0v3M2 8c0-3.312 2.664-6 6-6 4.002 0 6 3.336 6 3.336m0 0v-3m0 3h-2.664"
    />
  </svg>
);
