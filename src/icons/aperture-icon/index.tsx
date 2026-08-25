import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ApertureIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="m14.079 8.4 5.166 8.946M9.921 8.4h10.332M7.842 12l5.166-8.946M9.921 15.6 4.755 6.654m9.324 8.946H3.747M16.158 12l-5.166 8.946M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
      />
    </svg>
  );
};
