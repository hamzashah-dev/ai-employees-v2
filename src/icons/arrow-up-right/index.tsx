import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowUpRightIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        d="m12.48 5.522-7.19 7.19m7.954-1.59-.272-5.342c0-.684 0-.684-.75-.75L6.88 4.757"
      />
    </svg>
  );
};
