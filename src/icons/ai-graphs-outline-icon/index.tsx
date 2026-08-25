import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIGraphsOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="18" height="18" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M6.6 8.25H3.9c-.497 0-.9.448-.9 1V14c0 .552.403 1 .9 1h2.7c.497 0 .9-.448.9-1V9.25c0-.552-.403-1-.9-1M14.1 3h-2.7c-.497 0-.9.448-.9 1v10c0 .552.403 1 .9 1h2.7c.497 0 .9-.448.9-1V4c0-.552-.403-1-.9-1"
    />
  </svg>
);
