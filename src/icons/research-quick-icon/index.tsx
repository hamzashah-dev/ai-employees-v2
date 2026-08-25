import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ResearchQuickIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="14 14 28 28" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M29.59 17.5v8.077h7.16L26.41 38.5v-8.077h-7.16z"
    />
  </svg>
);
