import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const QuestionCircleIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M7.965 10.816v-.019m0-1.63c-.009-.595.532-.846.933-1.075.49-.27.821-.7.821-1.296a1.59 1.59 0 0 0-1.591-1.593c-.884 0-1.593.71-1.593 1.593M14 8A6 6 0 1 0 2 8a6 6 0 0 0 12 0Z"
      />
    </svg>
  );
};
