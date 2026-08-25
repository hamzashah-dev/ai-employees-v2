import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DispatchJobIconSquareDashedIcon: FC<PropsWithClassName> = ({
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
    <rect
      x="5.25"
      y="5.25"
      width="13.5"
      height="13.5"
      rx="2.25"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeDasharray="3.25 3.25"
      strokeLinejoin="round"
    />
  </svg>
);
