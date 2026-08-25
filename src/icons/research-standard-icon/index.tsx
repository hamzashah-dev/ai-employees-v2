import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ResearchStandardIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="14 14 28 28" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m24.77 24.77-1.616 8.076 8.077-1.615 1.615-8.077zm6.46 6.46-6.46-6.46M28 38.5c5.8 0 10.5-4.7 10.5-10.5S33.8 17.5 28 17.5 17.5 22.201 17.5 28 22.201 38.5 28 38.5"
    />
  </svg>
);
