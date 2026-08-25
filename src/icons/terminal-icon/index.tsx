import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TerminalIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="m5 16.375 5.25-5.25L5 5.875m7 12.25h7"
      />
    </svg>
  );
};
