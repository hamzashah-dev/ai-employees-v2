import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RocketIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_4863_94085)">
      <path
        d="m7.997 10-2-2m2 2c.932-.354 1.825-.801 2.667-1.333M7.997 10v3.333s2.02-.367 2.667-1.333c.72-1.08 0-3.333 0-3.333M5.997 8c.355-.92.802-1.803 1.334-2.633a8.587 8.587 0 0 1 7.333-4.034c0 1.814-.52 5-4 7.334M5.997 8H2.664s.367-2.02 1.333-2.667c1.08-.72 3.334 0 3.334 0M2.997 11c-1 .84-1.333 3.333-1.333 3.333S4.157 14 4.997 13c.474-.56.467-1.42-.06-1.94a1.453 1.453 0 0 0-1.94-.06Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4863_94085">
        <path fill="currentColor" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
