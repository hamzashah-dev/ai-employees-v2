import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LabelIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeWidth="1"
        d="M13.288 4.502c-.016-.84-.664-1.603-1.49-1.76-.17-.031-2.15-.062-2.97-.075a2.74 2.74 0 0 0-2.06.827 2716 2716 0 0 0-3.58 3.58c-.705.707-.695 1.81.031 2.544a522 522 0 0 0 3.163 3.163c.733.726 1.836.736 2.543.03a1147 1147 0 0 0 3.612-3.61 2.64 2.64 0 0 0 .783-1.708c.04-.536-.023-2.531-.032-2.991"
        clipRule="evenodd"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M9.218 5.828c.01.517.45.95.973.957a.917.917 0 0 0 .931-.933.994.994 0 0 0-.987-.971.915.915 0 0 0-.917.947"
        clipRule="evenodd"
      />
    </svg>
  );
};
