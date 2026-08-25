import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HexagonIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden
  >
    <path
      d="M17.4 8.25a1.5 1.5 0 0 0-.75-1.3l-5.25-3a1.5 1.5 0 0 0-1.5 0l-5.25 3a1.5 1.5 0 0 0-.75 1.3v6a1.5 1.5 0 0 0 .75 1.3l5.25 3a1.5 1.5 0 0 0 1.5 0l5.25-3a1.5 1.5 0 0 0 .75-1.3v-6Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinejoin="round"
    />
  </svg>
);
