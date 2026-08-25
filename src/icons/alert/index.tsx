import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AlertIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_1842_67675)">
        <path
          d="M10 6.666v3.333m0 3.334h.009m8.325-3.334a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1842_67675">
          <path fill="currentColor" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
