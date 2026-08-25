import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CircleIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      className={className}
    >
      <path
        d="M6 11.543a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
