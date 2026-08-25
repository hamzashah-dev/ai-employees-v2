import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DispatchJobIconDiamondIcon: FC<PropsWithClassName> = ({
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
      d="M12 4.25 18.75 12 12 19.75 5.25 12 12 4.25Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinejoin="round"
    />
  </svg>
);
