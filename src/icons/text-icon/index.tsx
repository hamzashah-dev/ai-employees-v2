import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const TextIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
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
        d="M3.333 5.5v-3h13.333v3M10 2.5v15m-2.963 0h5.926"
      />
    </svg>
  );
};
