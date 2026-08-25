import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MotionDesignIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <rect
      x="1.5"
      y="2.5"
      width="11"
      height="9"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M1.5 5h11"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M6 6.75v3l2.5-1.5L6 6.75Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
