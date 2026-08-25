import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DesktopCheckIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="112"
      height="112"
      fill="none"
      viewBox="0 0 112 112"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M74.13 19.332H12a3.667 3.667 0 0 0-3.667 3.667v58.666A3.667 3.667 0 0 0 12 85.332h88a3.667 3.667 0 0 0 3.666-3.667v-48.52M48.666 85.332l-7.333 18.333M63.333 85.332l7.333 18.333M34 103.664h44"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M103.666 8.332 74.333 44.999l-14.667-11"
      />
    </svg>
  );
};
