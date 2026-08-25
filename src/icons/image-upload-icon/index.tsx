import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageUploadIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M8.664 11.897H3.587a.923.923 0 0 1-.923-.923V3.589a.923.923 0 0 1 .923-.923h7.385a.923.923 0 0 1 .923.923v4.615m-9.23.53 2.403-2.405 3.596 3.596m4.154.126v4.615m0-4.615-1.846 1.846m1.846-1.846 1.846 1.846M8.78 6.704a1.154 1.154 0 1 1 0-2.307 1.154 1.154 0 0 1 0 2.307Z"
      />
    </svg>
  );
};
