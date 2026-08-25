import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const XIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="currentStroke"
      d="M4.167 15.833 15.834 4.167m-11.667 0 11.667 11.666"
    />
  </svg>
);
