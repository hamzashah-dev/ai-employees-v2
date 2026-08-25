import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingRenameIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 18 18" className={className}>
    <path
      stroke="currentColor"
      d="m10.617 3.86 3.523 3.523M2.25 15.75h3.523l9.247-9.248a2.492 2.492 0 0 0-3.522-3.522L2.25 12.227z"
    />
  </svg>
);
