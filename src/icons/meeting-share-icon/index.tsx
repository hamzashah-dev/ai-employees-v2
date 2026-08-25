import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingShareIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 18 18" className={className}>
    <path
      stroke="currentColor"
      d="M5.996 7.067H5.39C4.07 7.067 3 8.237 3 9.68v3.458c0 1.442 1.07 2.612 2.39 2.612h7.22c1.32 0 2.39-1.17 2.39-2.612V9.673c0-1.44-1.067-2.605-2.383-2.606h-.611M8.999 2.25v8.539m1.892-6.462L8.999 2.25 7.11 4.327"
    />
  </svg>
);
