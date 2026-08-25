import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingMsgIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 18 18" className={className}>
    <path
      stroke="currentColor"
      d="m16.156 4.733-5.39 4.384a2.79 2.79 0 0 1-3.47 0L1.859 4.733M16.5 11.578c0 2.305-1.537 4.178-3.818 4.172H5.318c-2.28.006-3.818-1.867-3.818-4.172v-5.15c0-2.303 1.537-4.178 3.818-4.178h7.364c2.28 0 3.818 1.875 3.818 4.177z"
    />
  </svg>
);
