import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RetryIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="38"
    height="38"
    fill="none"
    viewBox="0 0 38 38"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M32.316 13.51a14.34 14.34 0 0 0-13.232-8.76C11.168 4.75 4.75 11.13 4.75 19s6.418 14.25 14.334 14.25c7.167 0 13.105-5.228 14.166-12.058m-7.917-6.942h7.917V6.333"
    />
  </svg>
);
