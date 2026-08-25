import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StrikeThroughIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M7.997 8C6.402 8 5.11 6.657 5.11 5s1.293-3 2.888-3c1.202 0 2.232.762 2.668 1.846m-5.334 8.31C5.767 13.239 6.796 14 7.997 14c1.596 0 2.89-1.343 2.89-3 0-.238-.027-.47-.078-.692M2.664 8h10.667"
      />
    </svg>
  );
};
