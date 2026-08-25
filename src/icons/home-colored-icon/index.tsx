import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const HomeColoredIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <g clipPath="url(#home-colored-icon)">
        <path
          fill="#248eff"
          d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
        />
        <path
          fill="#fff"
          d="M6.497 12.391v-1.533c0-.389.332-.705.744-.707h1.513c.414 0 .75.316.75.707v1.529c0 .337.288.61.645.613h1.032c.482.001.945-.179 1.286-.5.341-.32.533-.757.533-1.211V6.933c0-.367-.173-.716-.471-.951L9.023 3.337a1.71 1.71 0 0 0-2.083.036L3.509 5.982c-.313.228-.5.578-.509.95v4.352C3 12.232 3.814 13 4.819 13h1.009a.67.67 0 0 0 .46-.177.6.6 0 0 0 .19-.432z"
        />
      </g>
      <defs>
        <clipPath id="home-colored-icon">
          <rect width="16" height="16" fill="#fff" rx="4" />
        </clipPath>
      </defs>
    </svg>
  );
};
