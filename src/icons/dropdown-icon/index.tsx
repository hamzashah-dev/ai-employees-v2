import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DropdownIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="8" height="8" fill="none" viewBox="0 0 8 8" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M6.667 2.667 4.189 5.252a.259.259 0 0 1-.378 0L1.333 2.667"
    />
  </svg>
);
