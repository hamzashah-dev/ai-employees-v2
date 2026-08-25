import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LeftAlignIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M2.664 2.666h10.667M2.664 5.333h8m-8 2.666h5.333m-5.333 5.334h10.667M2.664 10.666h8"
      />
    </svg>
  );
};
