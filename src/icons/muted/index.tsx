import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MuteIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      className={className}
      viewBox="0 0 16 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        d="m14.666 6-4 4m0-4 4 4M7.333 3.335 4 6.001H1.333v4H4l3.333 2.666V3.334Z"
      />
    </svg>
  );
};
