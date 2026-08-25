import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HourglassIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20" fill="none" className={className}>
    <path
      fill="currentColor"
      d="M5.25 17.5h10.5zM5.25 2.5h10.5zM14.25 17.5v-3.129a1.5 1.5 0 0 0-.44-1.06L10.5 10l-3.31 3.31a1.5 1.5 0 0 0-.44 1.061V17.5M6.75 2.5v3.129c0 .398.158.78.44 1.06L10.5 10l3.31-3.31a1.5 1.5 0 0 0 .44-1.061V2.5"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M5.25 17.5h10.5m-10.5-15h10.5m-1.5 15v-3.129a1.5 1.5 0 0 0-.44-1.06L10.5 10m0 0-3.31 3.31a1.5 1.5 0 0 0-.44 1.061V17.5M10.5 10 7.19 6.69a1.5 1.5 0 0 1-.44-1.061V2.5M10.5 10l3.31-3.31a1.5 1.5 0 0 0 .44-1.061V2.5"
    />
  </svg>
);
