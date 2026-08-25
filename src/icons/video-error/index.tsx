import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const VideoErrorIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="21"
      height="21"
      fill="none"
      viewBox="0 0 21 21"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        d="M9.383 5.09h2.783a1.667 1.667 0 0 1 1.667 1.666v1.95l.833.833 4.167-2.783v6.666M2.166 1.756l16.667 16.667m-5-5a1.666 1.666 0 0 1-1.667 1.666H3.833a1.667 1.667 0 0 1-1.667-1.667V6.756a1.667 1.667 0 0 1 1.667-1.667h1.666l8.334 8.333Z"
      />
    </svg>
  );
};
