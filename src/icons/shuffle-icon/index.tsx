import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ShuffleIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="m18 10 3-3-3-3m3 3h-5a4.98 4.98 0 0 0-3 1m5 6 3 3-3 3m3-3h-5a5 5 0 0 1-5-5 5 5 0 0 0-5-5H3m6 9a5 5 0 0 1-3 1H3"
      />
    </svg>
  );
};
