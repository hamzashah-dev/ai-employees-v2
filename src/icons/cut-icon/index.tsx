import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CutIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M8.436 11.557h1.333m2.222 0h1.334M4.168 6.606l5.155 2.96m-5.155-.17 9.164-5.395M4.666 6.668a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6.667a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      />
    </svg>
  );
};
