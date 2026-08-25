import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SunIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 2.25v1.038m0 11.423v1.039M15.75 9h-1.038M3.288 9H2.25m11.527-4.777-.737.737m-8.08 8.08-.737.737m9.554 0-.737-.737M4.96 4.96l-.737-.737M9 12.375a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75Z"
      />
    </svg>
  );
};
