import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TrashIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M3 4.95h12m-1.333 0v9.45c0 .675-.667 1.35-1.334 1.35H5.667c-.667 0-1.334-.675-1.334-1.35V4.95m2 0V3.6c0-.675.667-1.35 1.334-1.35h2.666c.667 0 1.334.675 1.334 1.35v1.35"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
