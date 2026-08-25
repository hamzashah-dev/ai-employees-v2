import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingRefreshIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 20 20" className={className}>
    <path
      stroke="currentColor"
      d="M18.75 9.75c0 4.968-4.032 9-9 9s-8.001-5.004-8.001-5.004m0 4.5v-4.5h4.068M.75 9.75c0-4.968 3.996-9 9-9 6.003 0 9 5.004 9 5.004m-3.996 0h3.996v-4.5"
    />
  </svg>
);
