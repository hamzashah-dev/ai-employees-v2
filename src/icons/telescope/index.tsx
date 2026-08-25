import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TelescopeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m11.032 25.333 4.701-8.592m0 0 4.702 8.592m-4.701-8.592v8.558m-.938-14.163L9.91 12.848c-1.318.462-1.998 1.866-1.518 3.135l.231.613c.48 1.27 1.938 1.924 3.256 1.462l4.885-1.712m-8.689-1.2-3.244 1.137c-.656.23-.994.928-.755 1.56.238.632.964.957 1.62.727l3.244-1.137m6.397-4.863c-.48-1.27.2-2.673 1.518-3.135l7.686-2.694c.659-.231 1.388.096 1.627.73l1.754 4.64c.24.635-.1 1.337-.76 1.568l-7.685 2.694c-1.318.462-2.776-.193-3.256-1.462z"
    />
  </svg>
);
