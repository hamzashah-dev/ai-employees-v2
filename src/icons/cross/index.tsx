import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CrossIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <g id="Cross" clipPath="url(#clip0_371_153189)">
        <g id="Cross_2">
          <path
            id="Vector"
            d="M4.695 4.695 10 10m0 0 5.303 5.303M9.999 9.999l-5.304 5.303M10 9.999l5.303-5.304"
            stroke="currentColor"
            strokeWidth="currentStroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_371_153189">
          <path fill="currentColor" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
