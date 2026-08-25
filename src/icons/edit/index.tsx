import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EditIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.628 1.75H4.541c-1.714 0-2.789 1.214-2.789 2.932v4.636c0 1.718 1.07 2.932 2.789 2.932h4.922c1.72 0 2.79-1.214 2.79-2.932v-2.09M9.706 2.285c.591-.66 1.28-.21 1.79.246.509.457 1.032 1.091.44 1.751L7.935 8.587c-.18.201-.433.321-.702.335l-1.352.069a.337.337 0 0 1-.353-.316l-.08-1.352a1 1 0 0 1 .256-.733z"
    />
  </svg>
);
