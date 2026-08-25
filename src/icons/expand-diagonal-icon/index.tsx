import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ExpandDiagonalIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m6.667 9.333-4 4m3.555 0H2.666V9.779m6.667-3.111 4-4m-3.555 0h3.555v3.555"
    />
  </svg>
);
