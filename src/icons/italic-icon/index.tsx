import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ItalicIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="m5.23 14 5.54-12M7.076 2H14M2 14h6.923"
      />
    </svg>
  );
};
