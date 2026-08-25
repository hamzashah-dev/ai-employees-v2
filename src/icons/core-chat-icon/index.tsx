import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CoreChatIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M13.3 4.816a6.046 6.046 0 0 0-10.8 3.74 6 6 0 0 0 1.015 3.36L2.5 14.617l2.446-.438m7.65-6.489a4.9 4.9 0 0 1 4.904 4.907 4.85 4.85 0 0 1-.82 2.713l.82 2.194-2.758-.497a4.903 4.903 0 0 1-6.932-5.495 4.91 4.91 0 0 1 4.786-3.822"
    />
  </svg>
);
