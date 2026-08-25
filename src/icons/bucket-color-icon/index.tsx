import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BucketColorIcon: FC<
  PropsWithClassName & { underlineColor?: string }
> = ({ className, underlineColor }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke={underlineColor ?? '#FF1818'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M2.633 13.813h10.73"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M5.363 2 7.51 4.167m-3.437 2.6h6.444m.86-.867L7.94 2.433 4.246 6.16a.87.87 0 0 0 0 1.213L6.48 9.627a.826.826 0 0 0 1.203 0L11.378 5.9Zm1.289 3.9c0 .23-.09.45-.252.613a.855.855 0 0 1-1.215 0 .87.87 0 0 1-.252-.613c0-.693.73-1.04.86-1.733.128.693.859 1.04.859 1.733Z"
      />
    </svg>
  );
};
