import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ColorModeIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M14.885 7.745a5.002 5.002 0 0 1-1.551 9.755A4.981 4.981 0 0 1 10 16.226m1.55-4.81a5 5 0 1 1-6.414-3.677M15 6.667a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
        stroke="currentColor"
        strokeWidth="currentStroke"
      />
    </svg>
  );
};
