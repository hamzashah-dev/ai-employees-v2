import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PlayCircleIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="15"
      fill="none"
      viewBox="0 0 14 15"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".875"
        clipPath="url(#a)"
      >
        <path d="M7 12.922A5.833 5.833 0 1 0 7 1.256a5.833 5.833 0 0 0 0 11.666Z" />
        <path d="m5.833 4.756 3.5 2.333-3.5 2.334V4.756Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 .09h14v14H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
