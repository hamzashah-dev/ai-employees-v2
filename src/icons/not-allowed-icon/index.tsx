import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const NotAllowedIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="14" height="14" fill="none" className={className}>
    <path
      stroke="currentColor"
      d="m10.508 3.492-7.016 7.016M1.75 7a5.252 5.252 0 0 1 8.962-3.712A5.25 5.25 0 0 1 12.25 7 5.25 5.25 0 0 1 7 12.25 5.25 5.25 0 0 1 1.75 7Z"
    />
  </svg>
);
