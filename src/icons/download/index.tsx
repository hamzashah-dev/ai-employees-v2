import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DownloadIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      d="M12 16.559V3m-6 9 5.293 4.78c.39.293 1.024.293 1.414 0L18 12M4 21h16"
    />
  </svg>
);
