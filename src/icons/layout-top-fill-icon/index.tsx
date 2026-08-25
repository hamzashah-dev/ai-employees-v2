import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const LayoutTopFillIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M3 5.25C3 4.00736 4.00736 3 5.25 3H12.75C13.9926 3 15 4.00736 15 5.25V12.75C15 13.9926 13.9926 15 12.75 15H5.25C4.00736 15 3 13.9926 3 12.75V5.25Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M15 6.75C15 7.99264 15 8.25 15 8.25L3 8.25C3 8.25 3 7.99264 3 6.75L3 5.25C3 4.00736 4.00736 3 5.25 3L12.75 3C13.9926 3 15 4.00736 15 5.25V6.75Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
