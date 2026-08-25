import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const InfoIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_8673_468880)">
      <path
        d="M7 9.333V7m0-2.333h.006M12.833 7A5.833 5.833 0 1 1 1.167 7a5.833 5.833 0 0 1 11.666 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </g>
    <defs>
      <clipPath id="clip0_8673_468880">
        <path fill="currentColor" d="M0 0h14v14H0z" />
      </clipPath>
    </defs>
  </svg>
);
