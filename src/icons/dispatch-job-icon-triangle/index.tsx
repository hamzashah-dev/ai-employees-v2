import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DispatchJobIconTriangleIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden
  >
    <path
      d="M12 5.25 18.9 18.25H5.1L12 5.25Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinejoin="round"
    />
  </svg>
);
