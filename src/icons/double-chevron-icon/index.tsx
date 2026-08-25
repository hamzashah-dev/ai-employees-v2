import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DoubleChevronIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="m7 15 5 5 5-5M7 9l5-5 5 5"
      />
    </svg>
  );
};
