import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingFolderIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 18 18" className={className}>
    <path
      stroke="currentColor"
      d="M3.75 3.375h3L9 5.625h5.25a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-8.25a1.5 1.5 0 0 1 1.5-1.5Z"
    />
  </svg>
);
