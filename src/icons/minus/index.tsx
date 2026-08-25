import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MinusIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      className={className}
    >
      <path
        d="M2.916 7.543h8.167"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
