import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ThumbsDownFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M16.5 3.01v5.408c0 .834-.684 1.518-1.518 1.518h-1.51V1.5h1.51A1.51 1.51 0 0 1 16.5 3.01ZM3.111 2.661l-1.59 7.03c-.15.863.507 1.65 1.388 1.65h4.48v3.28c0 1.032.844 1.875 1.865 1.875h.085a.94.94 0 0 0 .862-.571l2.559-5.99V1.5H4.499c-.685 0-1.266.487-1.388 1.162Z"
      fill="currentColor"
    />
  </svg>
);
