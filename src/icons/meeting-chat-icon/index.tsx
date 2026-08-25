import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingChatIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 12 12" className={className}>
    <path
      stroke="currentColor"
      d="M11.167 5.918a5.25 5.25 0 1 0-9.806 2.61 13 13 0 0 0-.59 2.005.43.43 0 0 0 .526.507 17 17 0 0 0 1.95-.6 5.25 5.25 0 0 0 7.919-4.522Z"
    />
  </svg>
);
