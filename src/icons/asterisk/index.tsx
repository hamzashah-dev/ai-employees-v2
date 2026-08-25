import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AsteriskIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="8" height="8" fill="none" viewBox="0 0 8 8" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 .667v6.666M1.333 2.205l5.334 3.59m-5.334 0 5.334-3.59"
    />
  </svg>
);
