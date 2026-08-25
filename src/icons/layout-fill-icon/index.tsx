import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const LayoutFillIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M3 5.25C3 4.00736 4.00736 3 5.25 3H12.75C13.9926 3 15 4.00736 15 5.25V12.75C15 13.9926 13.9926 15 12.75 15H5.25C4.00736 15 3 13.9926 3 12.75V5.25Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
