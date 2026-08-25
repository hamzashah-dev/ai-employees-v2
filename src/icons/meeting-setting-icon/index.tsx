import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingSettingIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 20 20" className={className}>
    <path
      stroke="currentColor"
      d="M9.75 3a2.25 2.25 0 1 0 4.5 0m-4.5 0a2.25 2.25 0 1 1 4.5 0m-4.5 0h-9m13.5 0h4.5M3 9.75a2.25 2.25 0 0 0 4.5 0m-4.5 0a2.25 2.25 0 1 1 4.5 0m-4.5 0H.75m6.75 0h11.25m-5.625 6.75a2.25 2.25 0 0 0 4.5 0m-4.5 0a2.25 2.25 0 0 1 4.5 0m-4.5 0H.75m16.875 0h1.125"
    />
  </svg>
);
