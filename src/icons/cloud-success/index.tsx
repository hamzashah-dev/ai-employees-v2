import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CloudSuccessIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M3.918 8.262c-4.224.286-4.224 6.201 0 6.488h4.026m-3.98-6.487C1.065.507 13.287-2.594 14.686 5.553c3.909.478 5.488 5.49 2.528 7.982m-7.475-.683 1.719 1.654 3.697-3.29"
      />
    </svg>
  );
};
