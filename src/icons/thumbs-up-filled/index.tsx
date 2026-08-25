import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ThumbsUpFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M1.5 14.99V9.583c0-.834.684-1.518 1.518-1.518h1.51V16.5h-1.51A1.51 1.51 0 0 1 1.5 14.99Zm13.389.348 1.59-7.03a1.404 1.404 0 0 0-1.388-1.65h-4.48v-3.28a1.878 1.878 0 0 0-1.865-1.875H8.66a.94.94 0 0 0-.862.571L5.24 8.064V16.5h8.261c.685 0 1.266-.487 1.388-1.162Z"
      fill="currentColor"
    />
  </svg>
);
