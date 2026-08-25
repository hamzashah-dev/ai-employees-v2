import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const WebsiteContentIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M4.75852 5.3665H4.71692M6.62274 5.3665H6.58114M8.48769 5.3665H8.44606M15.75 7.32771H2.25M5.83734 3H12.1633C14.3744 3 15.75 4.38746 15.75 6.35092V11.6491C15.75 13.6126 14.3744 15 12.1626 15H5.83734C3.62627 15 2.25 13.6126 2.25 11.6491V6.35092C2.25 4.38746 3.63284 3 5.83734 3Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
