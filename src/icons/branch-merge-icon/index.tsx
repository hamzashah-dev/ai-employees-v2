import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BranchMergeIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M4.385 11.23a1.385 1.385 0 1 1 0 2.77 1.385 1.385 0 0 1 0-2.77m0 0V4.77c0 2.768 3.23 4.153 6 4.153m0 0a1.385 1.385 0 1 1 2.769 0 1.385 1.385 0 0 1-2.77 0m-6-4.154a1.385 1.385 0 1 0 0-2.769 1.385 1.385 0 0 0 0 2.77"
    />
  </svg>
);
