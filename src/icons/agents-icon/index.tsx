import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AgentsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M10.7673 5.96669C10.2685 4.00889 9.24364 2.66669 8.06061 2.66669C6.38727 2.66669 5.0303 5.35289 5.0303 8.66669C5.0303 11.9805 6.38727 14.6667 8.06061 14.6667C8.26788 14.6667 8.47091 14.6253 8.66667 14.5467M9.99598 9.69091L12.3075 10.8069L11.1802 13.0953M12.303 10.8087C11.2097 11.3397 9.71273 11.6667 8.06061 11.6667C4.71333 11.6667 2 10.3233 2 8.66669C2 7.01009 4.71333 5.66669 8.06061 5.66669C10.9927 5.66669 13.4382 6.69749 14 8.06669"
      stroke="currentColor"
      strokeOpacity="currentOpacity"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
