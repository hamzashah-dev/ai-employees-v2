import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MoonIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.621 12.614a7.888 7.888 0 0 1-3.726-.95 7.104 7.104 0 0 1-2.694-2.55 6.372 6.372 0 0 1-.928-3.453A6.41 6.41 0 0 1 8.366 2.25c-1.81.292-3.436 1.194-4.562 2.528C2.677 6.113 2.13 7.786 2.272 9.471c.14 1.685.958 3.261 2.294 4.422 1.335 1.16 3.092 1.823 4.93 1.857a7.797 7.797 0 0 0 3.588-.859 7.059 7.059 0 0 0 2.666-2.37c-.373.056-.75.087-1.129.093Z"
      />
    </svg>
  );
};
