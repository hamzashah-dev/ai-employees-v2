import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StocksIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <g clipPath="url(#stocks-icon-clip)">
      <path
        fill="#16A34A"
        d="M0 4C0 1.79086 1.79086 0 4 0H12C14.2091 0 16 1.79086 16 4V12C16 14.2091 14.2091 16 12 16H4C1.79086 16 0 14.2091 0 12V4Z"
      />
      <line
        x1="5.5"
        y1="3.4"
        x2="5.5"
        y2="12.6"
        stroke="#fff"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <rect x="4.5" y="5.2" width="2" height="4.2" rx="0.4" fill="#fff" />
      <line
        x1="10.5"
        y1="4.2"
        x2="10.5"
        y2="13"
        stroke="#fff"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <rect x="9.5" y="6.6" width="2" height="3.6" rx="0.4" fill="#fff" />
    </g>
    <defs>
      <clipPath id="stocks-icon-clip">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
