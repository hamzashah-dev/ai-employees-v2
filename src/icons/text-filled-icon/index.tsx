import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TextFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <g clipPath="url(#a)">
      <path
        fill="#ff8789"
        d="M0 3.5A3.5 3.5 0 0 1 3.5 0h7A3.5 3.5 0 0 1 14 3.5v7a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 0 10.5z"
      />
      <path
        stroke="#ededed"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".875"
        d="M2.917 4.244V2.406h8.167v1.838M7 2.406v9.188m-1.814 0h3.63"
      />
    </g>
    <defs>
      <clipPath id="a">
        <rect width="14" height="14" fill="#fff" rx="2.333" />
      </clipPath>
    </defs>
  </svg>
);
