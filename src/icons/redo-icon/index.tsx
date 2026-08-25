import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RedoIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M13.1931 14.25H6.30504C3.92866 14.25 2 12.3863 2 10.0899C2 7.79358 3.92866 5.92987 6.30504 5.92987H15.7761M13.7958 8.00991L16 5.87995L13.7958 3.75"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
