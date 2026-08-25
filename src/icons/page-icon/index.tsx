import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PageIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M14.232 3.063v2.892c0 1.411 1.123 2.558 2.512 2.56h2.693M13.757 3c.548 0 1.073.227 1.453.63l3.728 3.95c.36.38.562.89.562 1.42v8.163c.014 2.057-1.576 3.753-3.596 3.837l-7.794-.001c-2.038-.046-3.654-1.763-3.61-3.836V6.657C4.55 4.617 6.193 2.99 8.199 3z"
    />
  </svg>
);
