import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SwitchConnectIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m2.5 17.5 1.875-1.875m0 0a3.535 3.535 0 0 0 5 0l1.25-1.25-5-5-1.25 1.25a3.536 3.536 0 0 0 0 5M17.5 2.5l-1.875 1.875m0 0a3.535 3.535 0 0 1 0 5l-1.25 1.25-5-5 1.25-1.25a3.536 3.536 0 0 1 5 0m-8.75 6.25L8.75 8.75m.625 4.375 1.875-1.875"
    />
  </svg>
);
