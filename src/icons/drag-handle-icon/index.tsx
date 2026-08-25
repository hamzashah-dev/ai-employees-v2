import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DragHandleIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M6 8.668a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM6 4.001a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM6 13.335A.667.667 0 1 0 6 12a.667.667 0 0 0 0 1.334ZM10 8.668a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM10 4.001a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM10 13.335a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333Z"
      />
    </svg>
  );
};
