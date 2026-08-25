import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GraphsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_13165_7013)">
      <path
        d="M0 3.5C0 1.567 1.567 0 3.5 0H10.5C12.433 0 14 1.567 14 3.5V10.5C14 12.433 12.433 14 10.5 14H3.5C1.567 14 0 12.433 0 10.5V3.5Z"
        fill="#FF8F17"
      />
      <rect
        x="3.5"
        y="6.125"
        width="2.625"
        height="5.25"
        rx="0.583333"
        fill="white"
      />
      <rect
        x="7.875"
        y="2.625"
        width="2.625"
        height="8.75"
        rx="0.583333"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_13165_7013">
        <rect width="14" height="14" rx="4" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
