import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const UploadIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M21 14.5v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311c-.642.327-1.482.327-3.162.327H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.22 3 17.38 3 15.7v-1.2m4-6 5-5 5 5m-5-5v12"
      />
    </svg>
  );
};
