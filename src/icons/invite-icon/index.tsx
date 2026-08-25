import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const InviteIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="currentOpacity"
        strokeWidth="currentStroke"
        d="M10.029 7.808v4.442m-2.221-2.221h4.442m-5.452 1.413H1.75v-.403A3.635 3.635 0 0 1 7.74 8.27M5.386 5.788a2.02 2.02 0 1 0 0-4.038 2.02 2.02 0 0 0 0 4.038Z"
      />
    </svg>
  );
};
