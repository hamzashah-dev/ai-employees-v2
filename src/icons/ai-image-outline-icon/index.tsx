import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIImageOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.835 14.002C5.4 10.44 10.358 8.667 14 8.447m0-3.095v5.301c0 1.964-1.229 3.35-3.192 3.35H5.185C3.222 14.003 2 12.617 2 10.653V5.352c0-1.964 1.229-3.35 3.185-3.35h5.623c1.963 0 3.192 1.386 3.192 3.35m-6.78 1.17a1.132 1.132 0 1 1-2.264.001 1.132 1.132 0 0 1 2.263 0"
    />
  </svg>
);
