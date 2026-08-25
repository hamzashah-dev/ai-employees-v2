import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ResumeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <g clipPath="url(#a)">
      <path
        fill="#fa4d56"
        d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
      />
      <path
        fill="#fff"
        d="M13 4.8a.8.8 0 0 0-.8-.8H3.8a.8.8 0 1 0 0 1.6h8.4a.8.8 0 0 0 .8-.8M3 8a.8.8 0 0 1 .8-.8h8.4a.8.8 0 0 1 0 1.6H3.8A.8.8 0 0 1 3 8M10.5 11.2a.8.8 0 0 0-.8-.8H3.8a.8.8 0 0 0 0 1.6h5.9a.8.8 0 0 0 .8-.8"
      />
    </g>
    <defs>
      <clipPath id="a">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
