import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ChevronDownIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      className={className}
    >
      <path
        d="m4.5 7.105 4.5 4.5 4.5-4.5"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
