import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CommentIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M7.2709 8.78375H12.8713M7.22657 12.0238H10.0487M6.70194 16.7379C7.69731 17.226 8.81667 17.5001 10.0001 17.5001C14.1423 17.5001 17.5001 14.1423 17.5001 10.0001C17.5001 5.85793 14.1422 2.5 10 2.5C5.85787 2.5 2.5 5.85787 2.5 10C2.5 11.1834 2.77409 12.3028 3.26225 13.2982C3.69288 14.1944 3.28052 15.1771 3.06226 16.0762C2.93788 16.5692 3.43097 17.0623 3.92399 16.9378C4.82237 16.7113 5.80488 16.3068 6.70194 16.7379Z"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
