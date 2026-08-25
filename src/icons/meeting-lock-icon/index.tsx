import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingLockIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 8 9" className={className}>
    <path
      stroke="currentColor"
      d="M6.871 4.253a.71.71 0 0 0-.708-.708H1.208a.71.71 0 0 0-.708.708v3.54a.71.71 0 0 0 .708.707h2.789m2.166-5.032v-.49a2.478 2.478 0 1 0-4.955 0v.49m5.664.785v3.54a.71.71 0 0 1-.708.707H3.375"
    />
  </svg>
);
