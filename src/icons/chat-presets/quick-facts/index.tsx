import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const QuickFactsPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#4674F1"
      fillRule="evenodd"
      d="M17.893 20.467a1.872 1.872 0 0 1-.163-.186 8.286 8.286 0 1 1 2.574-2.587c.067.05.132.107.194.169l5.993 5.994a1.841 1.841 0 1 1-2.605 2.604l-5.993-5.994ZM6.861 13.306a6.445 6.445 0 1 1 12.89 0 6.445 6.445 0 0 1-12.89 0Zm10.866-1.6a.92.92 0 1 0-1.302-1.302l-4.342 4.342-1.846-1.845a.92.92 0 1 0-1.302 1.302l2.497 2.497a.92.92 0 0 0 1.302 0l4.993-4.994Z"
      clipRule="evenodd"
    />
  </svg>
);
