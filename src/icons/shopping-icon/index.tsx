import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ShoppingIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M6.667 7.5V5.284c0-1.538 1.119-2.784 2.5-2.784 1.38 0 2.5 1.246 2.5 2.784v.029M9.494 7.5H3.977l-1.462 8.706A1.114 1.114 0 0 0 3.62 17.5h10.262c.691 0 1.217-.617 1.104-1.294l-.09-.532m-3.228-5.857.7-2.317 2.594.303L17.5 11.32l-3.333 2.43-2.5-3.933Z"
    />
  </svg>
);
