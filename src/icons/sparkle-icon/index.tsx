import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SparkleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M5.41494 0.600098C6.11695 3.04912 7.9219 4.96575 10.2283 5.71111C7.9219 6.45656 6.11695 8.37319 5.41494 10.8222C4.71295 8.37319 2.90795 6.45656 0.601562 5.71111C2.90795 4.96575 4.71295 3.04912 5.41494 0.600098Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.9588 8.43727C11.2859 9.57836 12.1269 10.4714 13.2016 10.8187C12.1269 11.166 11.2859 12.0591 10.9588 13.2001C10.6317 12.0591 9.79074 11.166 8.71612 10.8187C9.79074 10.4714 10.6317 9.57836 10.9588 8.43727Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
