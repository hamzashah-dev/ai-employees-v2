import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FileTextIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M11.666 1.667v5h5m-3.333 4.166H6.666m6.667 3.333H6.666M8.333 7.5H6.666m5.417-5.833H5a1.667 1.667 0 0 0-1.667 1.666v13.334A1.667 1.667 0 0 0 5 18.332h10a1.667 1.667 0 0 0 1.666-1.666V6.25l-4.583-4.583Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
