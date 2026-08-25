import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingThreeDotsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 11 2" className={className}>
    <path
      stroke="currentColor"
      d="M9.979.935v.048M5.46.935v.048M.947.935v.048m9.226-.038a.196.196 0 1 1-.39 0 .196.196 0 0 1 .39 0Zm-4.517 0a.196.196 0 1 1-.392 0 .196.196 0 0 1 .392 0Zm-4.515 0a.196.196 0 1 1-.391 0 .196.196 0 0 1 .391 0Z"
    />
  </svg>
);
