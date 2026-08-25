import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DispatchJobIconStarIcon: FC<PropsWithClassName> = ({
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
      d="M12 3.25 14.1 9.2h6.35l-5.14 3.74 1.96 6.03L12 15.48l-5.27 3.83 1.96-6.03-5.14-3.74H9.9L12 3.25Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinejoin="round"
    />
  </svg>
);
