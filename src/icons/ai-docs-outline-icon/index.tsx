import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIDocsOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.164 10.613H5.836m4.328-2.704H5.836M7.486 5.21H5.836M5.36 14h5.279c1.487 0 2.694-1.23 2.694-2.746V4.746C13.334 3.23 12.127 2 10.64 2H5.36C3.874 2 2.668 3.23 2.668 4.746v6.508C2.667 12.77 3.873 14 5.361 14"
    />
  </svg>
);
