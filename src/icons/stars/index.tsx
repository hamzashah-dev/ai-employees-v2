import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StarsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M3.333 2v2.667m9.334 6.666V14M2 3.333h2.667m6.666 9.334H14M8 2 6.725 5.875a1.333 1.333 0 0 1-.85.85L2 8l3.875 1.275a1.333 1.333 0 0 1 .85.85L8 14l1.275-3.875a1.333 1.333 0 0 1 .85-.85L14 8l-3.875-1.275a1.333 1.333 0 0 1-.85-.85L8 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
