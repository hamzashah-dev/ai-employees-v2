import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TripIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg viewBox="0 0 14 14" fill="none" className={className}>
    <rect width="14" height="14" rx="2.625" fill="url(#trip-icon-gradient)" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 1.1377C4.585 1.1377 2.625 3.0977 2.625 5.5127C2.625 8.79395 7 12.5127 7 12.5127C7 12.5127 11.375 8.79395 11.375 5.5127C11.375 3.0977 9.415 1.1377 7 1.1377ZM7 3.8502C7.91875 3.8502 8.6625 4.59395 8.6625 5.5127C8.6625 6.43145 7.91875 7.1752 7 7.1752C6.08125 7.1752 5.3375 6.43145 5.3375 5.5127C5.3375 4.59395 6.08125 3.8502 7 3.8502Z"
      fill="white"
    />
    <defs>
      <linearGradient
        id="trip-icon-gradient"
        x1="0"
        y1="0"
        x2="14"
        y2="14"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7CC327" />
        <stop offset="1" stopColor="#0C995C" />
      </linearGradient>
    </defs>
  </svg>
);
