import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const YoutubePlayIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="92"
    height="92"
    fill="none"
    viewBox="0 0 92 92"
    className={className}
  >
    <path
      fill="#F71616"
      d="M9.583 65.167a92.46 92.46 0 0 1 0-38.334 7.668 7.668 0 0 1 5.367-5.366 189.978 189.978 0 0 1 62.1 0 7.666 7.666 0 0 1 5.367 5.366 92.46 92.46 0 0 1 0 38.334 7.667 7.667 0 0 1-5.367 5.366 189.94 189.94 0 0 1-62.1 0 7.667 7.667 0 0 1-5.367-5.366Z"
    />
    <path fill="#F71616" d="M38.333 57.5 57.5 46 38.333 34.5v23Z" />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9.583 65.167a92.46 92.46 0 0 1 0-38.334 7.668 7.668 0 0 1 5.367-5.366 189.978 189.978 0 0 1 62.1 0 7.666 7.666 0 0 1 5.367 5.366 92.46 92.46 0 0 1 0 38.334 7.667 7.667 0 0 1-5.367 5.366 189.94 189.94 0 0 1-62.1 0 7.667 7.667 0 0 1-5.367-5.366Z"
    />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M38.333 57.5 57.5 46 38.333 34.5v23Z"
    />
  </svg>
);
