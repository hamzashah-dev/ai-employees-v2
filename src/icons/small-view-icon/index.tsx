import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const SmallViewIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="m2.5 2.5 5.625 5.625m0 0h-5m5 0v-5M17.5 17.5l-5.625-5.625m0 0h5m-5 0v5"
    />
  </svg>
);
