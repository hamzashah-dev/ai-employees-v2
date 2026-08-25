import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CenterAlignIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
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
        strokeWidth="currentStroke"
        d="M13.335 2.664H2.668m9.333 2.667h-8m6.667 2.666H5.335m8 5.334H2.668m9.333-2.667h-8"
      />
    </svg>
  );
};
