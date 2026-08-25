import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MoreHorizontalIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M8 8.755a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM12.667 8.755a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM3.333 8.755a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
