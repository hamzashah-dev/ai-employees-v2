import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const AllIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      fill="#248EFF"
      d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
    />
    <path
      fill="#fff"
      d="M3 4.5A1.5 1.5 0 0 1 4.5 3h1A1.5 1.5 0 0 1 7 4.5v1A1.5 1.5 0 0 1 5.5 7h-1A1.5 1.5 0 0 1 3 5.5zM9 4.5A1.5 1.5 0 0 1 10.5 3h1A1.5 1.5 0 0 1 13 4.5v1A1.5 1.5 0 0 1 11.5 7h-1A1.5 1.5 0 0 1 9 5.5zM9 10.5A1.5 1.5 0 0 1 10.5 9h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 11.5zM3 10.5A1.5 1.5 0 0 1 4.5 9h1A1.5 1.5 0 0 1 7 10.5v1A1.5 1.5 0 0 1 5.5 13h-1A1.5 1.5 0 0 1 3 11.5z"
    />
  </svg>
);
