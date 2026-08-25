import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const FullViewIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M8.125 8.125 2.5 2.5m0 0h5m-5 0v5m9.375 4.375L17.5 17.5m0 0h-5m5 0v-5"
    />
  </svg>
);
