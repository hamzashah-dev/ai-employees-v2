import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CheckIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      className={className}
    >
      <path
        d="M11.083 4.625 5.468 10.24 2.916 7.687"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
