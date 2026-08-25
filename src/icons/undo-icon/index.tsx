import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const UndoIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M4.01 13h6.56c2.262 0 4.1-1.775 4.1-3.962 0-2.187-1.838-3.962-4.1-3.962H1.55m1.885 1.981-2.1-2.028L3.436 3"
      />
    </svg>
  );
};
