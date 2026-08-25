import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowTopRightIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.333"
      d="M4.666 4.667h6.667v6.667M4.666 11.334l6.667-6.667"
    />
  </svg>
);
