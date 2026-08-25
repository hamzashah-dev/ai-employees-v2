import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LayoutTextIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M14 2.666H2m12 7.112H2m9.333-3.558H2m9.333 7.113H2"
      />
    </svg>
  );
};
