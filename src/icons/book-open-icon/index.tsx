import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const BookOpenIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M9 5.57692C9 5.57692 10.8757 2.75003 14.627 2.25838C15.2432 2.17762 15.75 2.69198 15.75 3.31624V11.2286C15.75 11.8529 15.2432 12.3507 14.627 12.4314C10.8757 12.9231 9 15.75 9 15.75M9 5.57692V15.75M9 5.57692C9 5.57692 7.12431 2.75003 3.37294 2.25838C2.75684 2.17762 2.25 2.69198 2.25 3.31624V11.2286C2.25 11.8529 2.75684 12.3507 3.37294 12.4314C7.12431 12.9231 9 15.75 9 15.75"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
