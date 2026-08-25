import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TelescopeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M17.083 4.167 12.5 8.75M7.5 13.75l-3.333 3.333M10 11.25 6.25 15M12.5 8.75l-2.5 2.5M4.583 15.417a.833.833 0 1 0 1.667 0 .833.833 0 0 0-1.667 0ZM15.417 2.917l1.666 1.667-8.75 8.75-1.666-1.667 8.75-8.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
