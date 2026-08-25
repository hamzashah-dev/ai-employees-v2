import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FolderClosedIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M3.333 3H6l2 2h4.667A1.333 1.333 0 0 1 14 6.333v5.334A1.334 1.334 0 0 1 12.667 13H3.333A1.334 1.334 0 0 1 2 11.667V4.333A1.333 1.333 0 0 1 3.333 3"
      />
    </svg>
  );
};
