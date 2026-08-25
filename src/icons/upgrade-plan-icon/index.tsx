import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const UpgradePlanIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg width="16" height="16" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M8.934 2a6.073 6.073 0 0 1 0 12M7.066 2a6 6 0 0 0-1.837.597M3.718 3.696a6.1 6.1 0 0 0-1.136 1.561m-.577 1.777a6.1 6.1 0 0 0 0 1.932m.577 1.777c.294.58.68 1.107 1.136 1.561m1.51 1.1A6 6 0 0 0 7.067 14m-1.4-6.934L8 4.73l2.335 2.335M8 4.73v6.538"
      />
    </svg>
  );
};
