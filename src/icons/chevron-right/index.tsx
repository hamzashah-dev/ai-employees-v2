import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ChevronRightIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      className={className}
    >
      <path
        d="m7.5 15.082 5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
