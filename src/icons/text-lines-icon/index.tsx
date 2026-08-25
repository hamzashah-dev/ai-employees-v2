import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const TextLinesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2 3.84613H14M2 7.99998H14M2 12.1538H8.92308"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
