import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ExtendIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M11.077 8.82v4.513m-2.256-2.257h4.512M2.667 2.666h10.666M2.667 8.41H8.41M2.667 5.538h10.666"
      />
    </svg>
  );
};
