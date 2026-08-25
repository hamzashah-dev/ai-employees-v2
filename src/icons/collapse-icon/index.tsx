import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CollapseIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeWidth="currentStroke"
        d="M11.333 1.25a3.417 3.417 0 0 1 3.417 3.417v6.666a3.417 3.417 0 0 1-3.417 3.417H4.667a3.417 3.417 0 0 1-3.417-3.417V4.667A3.417 3.417 0 0 1 4.667 1.25h6.666Z"
      />
      <path
        fill="currentColor"
        stroke="currentColor"
        d="M3.999 3.833c.092 0 .166.075.166.167v8a.166.166 0 0 1-.333 0V4c0-.092.075-.167.167-.167Z"
      />
    </svg>
  );
};
