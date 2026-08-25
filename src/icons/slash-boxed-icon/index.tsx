import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SlashBoxedIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="currentStroke"
        d="m11.25 6-4.5 6M6 15h6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
      />
    </svg>
  );
};
