import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingVideoIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 16 12" className={className}>
    <path
      stroke="currentColor"
      d="M3.592 8.13h2.131m5.64-3.715 2.555-2.084a.97.97 0 0 1 1.363.134.96.96 0 0 1 .219.613l-.009 5.683a.967.967 0 0 1-1.583.744l-2.545-2.084M8.48.5H3.387C1.612.5.5 1.753.5 3.525v4.783c0 1.773 1.107 3.025 2.887 3.025H8.48c1.78 0 2.89-1.252 2.89-3.025V3.525C11.368 1.753 10.258.5 8.48.5Z"
    />
  </svg>
);
