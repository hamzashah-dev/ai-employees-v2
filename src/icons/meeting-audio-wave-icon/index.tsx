import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingAudioWaveIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 18 18" className={className}>
    <path
      stroke="#0062c6"
      d="M2.25 7.442v3.116m3.375-5.712v8.308M9 2.25v13.5m3.375-10.904v8.308m3.375-5.712v3.116"
    />
  </svg>
);
