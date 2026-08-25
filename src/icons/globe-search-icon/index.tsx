import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GlobeSearchIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M11.306 20.99a9.01 9.01 0 0 1-8.273-8.986C3.033 7.038 7.062 3 12.037 3c4.601 0 8.385 3.449 8.93 7.899m-5.595.186a20 20 0 0 0-.197-2.21C14.706 5.445 13.48 3 12.035 3c-1.433 0-2.67 2.445-3.137 5.875a22 22 0 0 0-.216 3.129c0 1.106.075 2.164.216 3.138.328 2.38 1.34 4.676 2.407 5.847m-8.272-8.977h8.598m7.628 7.298a3.118 3.118 0 1 1-4.409-4.41 3.118 3.118 0 0 1 4.41 4.41m0 0L20.948 21"
    />
  </svg>
);
