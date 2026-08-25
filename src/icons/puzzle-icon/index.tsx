import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PuzzleIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M14 9.847a1.846 1.846 0 0 0-2.77-1.596V5.695a.923.923 0 0 0-.922-.923H7.75a1.845 1.845 0 1 0-3.194 0H2.923A.923.923 0 0 0 2 5.695v1.9a1.94 1.94 0 0 1 .462-.055A1.846 1.846 0 1 1 2 11.176v1.901a.923.923 0 0 0 .923.923h2.363a1.91 1.91 0 0 1-.055-.461 1.845 1.845 0 0 1 3.692 0c0 .155-.018.31-.055.461h1.44a.923.923 0 0 0 .923-.923v-1.633A1.847 1.847 0 0 0 14 9.847Z"
      />
    </svg>
  );
};
