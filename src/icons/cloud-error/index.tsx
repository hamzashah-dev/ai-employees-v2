import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CloudErrorIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="16"
      fill="none"
      viewBox="0 0 20 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M3.918 8.262c-4.224.286-4.224 6.201 0 6.488h4.477M3.963 8.263C1.066.507 13.288-2.594 14.687 5.553c3.909.478 5.488 5.49 2.528 7.982m-5.67 1.154 3.611-3.474m-3.61-.001 3.61 3.474"
      />
    </svg>
  );
};
