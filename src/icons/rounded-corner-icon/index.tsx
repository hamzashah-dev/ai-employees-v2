import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RoundedCornerIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M4 13V8a4 4 0 0 1 4-4h5"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
