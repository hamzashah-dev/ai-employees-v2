import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const InsertColIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M10.666 13.335V2.668M5.333 5.335V8m0 0v2.667m0-2.667H2.666m2.667 0H8"
    />
  </svg>
);
