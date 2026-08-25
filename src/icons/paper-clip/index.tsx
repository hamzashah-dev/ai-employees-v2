import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PaperClipIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_4657_18331)">
      <path
        d="m14.293 8-6.126 6.126a4.002 4.002 0 1 1-5.66-5.66L8.22 2.753A2.67 2.67 0 0 1 12 6.526l-5.727 5.713a1.334 1.334 0 0 1-1.886-1.886l5.66-5.654"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4657_18331">
        <path fill="#fff" transform="translate(0 .633)" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
