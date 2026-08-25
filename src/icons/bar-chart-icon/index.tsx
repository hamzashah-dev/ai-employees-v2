import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const BarChartIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M3 21V3H8.99994V21L9 10.5H14.9999V21L15 6.75H21V21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
