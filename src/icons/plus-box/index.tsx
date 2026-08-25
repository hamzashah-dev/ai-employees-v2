import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PlusBoxIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_4851_48694)">
      <path
        d="M6.5 10.166h7.333m-3.667 3.667V6.5m-2.75 12.833h5.5c4.584 0 6.417-1.833 6.417-6.416v-5.5C19.333 2.833 17.5 1 12.917 1h-5.5C2.833 1 1 2.833 1 7.417v5.5c0 4.583 1.833 6.416 6.417 6.416Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4851_48694">
        <path fill="currentColor" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
);
