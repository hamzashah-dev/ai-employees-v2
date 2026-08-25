import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowLeftIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="currentStroke"
      d="M3.626 8h9.039m-6-4L3.479 7.529c-.472.471-.472.471 0 .942L6.665 12"
    />
  </svg>
);
