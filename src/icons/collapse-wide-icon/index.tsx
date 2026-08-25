import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const CollapseWideIcon: FC<PropsWithClassName> = ({ className }) => {
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
        stroke="currentStroke"
        d="M4.665 3.834h1.334c.46 0 .833.373.833.833v6.667c0 .46-.373.833-.833.833H4.665a.833.833 0 0 1-.833-.833V4.667c0-.46.373-.833.833-.833Z"
      />
    </svg>
  );
};
