import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIVideosOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.474 9.77h1.704m4.513-2.972 2.043-1.667A.777.777 0 0 1 14 5.729l-.007 4.546a.773.773 0 0 1-1.266.595L10.69 9.205M8.385 3.666H4.31C2.89 3.667 2 4.67 2 6.087v3.827c0 1.418.885 2.42 2.31 2.42h4.073c1.425 0 2.312-1.002 2.312-2.42V6.087c0-1.418-.887-2.42-2.31-2.42"
    />
  </svg>
);
